import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faHeart } from "@fortawesome/free-regular-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

import "./PokemonDetail.scss";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ProgressBar, Tab, Tabs } from "react-bootstrap";

function CapitalizeFirstLetter(data) {
  return data.charAt(0).toUpperCase() + data.slice(1);
}

export default function PokemonDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pokemonDetail, setPokemonDetail] = useState();
  const [pokemonMoves, setPokemonMoves] = useState([]);
  const [evolutionChainUrl, setEvolutionChainUrl] = useState();
  const [evolutionsData, setEvolutionsData] = useState([]);

  const [key, setKey] = useState("about");

  const GetSpecies = async (url) => {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      throw new Error(`Failed to hit API for data:`);
    }
  };

  const InputDataToEvolutions = async (evolutionList, evolves_to) => {
    evolves_to.forEach((x) => {
      var newEvolve = {
        name: x.species.name,
        minLevel: x.evolution_details[0].min_level,
      };

      evolutionList.push(newEvolve);
      if (x.evolves_to.length > 0) {
        InputDataToEvolutions(evolutionList, x.evolves_to);
      }
    });
  };

  const GetEvolutions = async () => {
    if (evolutionChainUrl) {
      try {
        const evolutionResponse = await axios.get(evolutionChainUrl);
        const evolutionDataChain = evolutionResponse.data.chain;
        var evolutionList = [];
        if (evolutionDataChain.evolves_to.length > 0) {
          InputDataToEvolutions(evolutionList, evolutionDataChain.evolves_to);
        }
        setEvolutionsData(evolutionList);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const MoveService = async (url) => {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      throw new Error(`Failed to hit API for data:`);
    }
  };

  const GetMoves = async () => {
    const promiseResult = pokemonDetail.moves.map((x) =>
      MoveService(x.move.url)
    );
    try {
      const movesResponse = await Promise.all(promiseResult);

      var movesList = [];
      movesResponse.map((x) => {
        var data = x.data;
        var newMove = {
          name: data.name,
          accuracy: data.accuracy ? data.accuracy : 0,
          power: data.power ? data.power : 0,
          pp: data.pp ? data.pp : 0,
        };
        movesList.push(newMove);
      });
      setPokemonMoves(movesList);
    } catch (error) {
      console.error(error);
    }
  };

  const GetGender = async (rate) => {
    let link = "https://pokeapi.co/api/v2/gender/" + rate + "/";
    try {
      const response = await axios.get(link);
      return response;
    } catch (error) {
      throw new Error(`Failed to hit API for data:`);
    }
  };

  const GetPokemonDetail = async () => {
    var url = "https://pokeapi.co/api/v2/pokemon/" + id + "/";
    try {
      const response = await axios.get(url);
      const data = response.data;

      const species = await GetSpecies(data.species.url);
      const speciesData = species.data;
      var generaDataEn = speciesData.genera.filter((x) => {
        return x.language.name == "en";
      });
      var generaName = "";
      if (generaDataEn.length > 0) {
        var generaNameSplit = generaDataEn[0].genus.split(" ");
        generaName = generaNameSplit[0];
      }

      var egg_groups = speciesData.egg_groups[0].name;
      const gender = await GetGender(speciesData.gender_rate);

      var abilities = "";
      data.abilities.forEach((x) => {
        abilities +=
          abilities == ""
            ? CapitalizeFirstLetter(x.ability.name)
            : ", " + CapitalizeFirstLetter(x.ability.name);
      });

      setPokemonDetail({
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        species: generaName,
        abilities: abilities,
        eggGroups: egg_groups,
        gender: gender.data.name,
        types: data.types,
        sprites: data.sprites,
        stats: data.stats,
        moves: data.moves,
      });
      setEvolutionChainUrl(speciesData.evolution_chain.url);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    GetPokemonDetail(id);
  }, [id]);

  useEffect(() => {
    if (key == "moves") {
      GetMoves();
    }
    if (key == "evolutions") {
      GetEvolutions();
    }
  }, [key]);

  const backToList = async (e) => {
    navigate("/");
  };

  if (pokemonDetail) {
    return (
      <div className={`container-fluid ${pokemonDetail.types[0].type.name}`}>
        <div className="container">
          <div className="px-3">
            <div className="row py-4">
              <div className="col-6 text-start">
                <FontAwesomeIcon
                  icon={faArrowLeft}
                  className="icon-size"
                  onClick={(e) => backToList(e)}
                />
              </div>
              <div className="col-6 text-end">
                <FontAwesomeIcon icon={faHeart} className="icon-size" />
              </div>
            </div>

            <div className="row justify-content-center">
              <div className="d-flex">
                <div className="d-flex flex-column">
                  <h1>{CapitalizeFirstLetter(pokemonDetail.name)}</h1>
                  <div className="d-flex mt-3">
                    {pokemonDetail.types.map((data, index2) => {
                      return (
                        <div
                          className={`type ${index2 > 0 ? "ms-2" : ""}`}
                          key={"type" + index2}
                        >
                          <p className={pokemonDetail.types[0].type.name}>
                            {CapitalizeFirstLetter(data.type.name)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="number">
                  {"#" + pokemonDetail.id.toString().padStart(3, "0")}
                </div>
              </div>
            </div>
            <div className="row justify-content-center">
              <div className="image-wrapper text-center">
                <img
                  src={
                    pokemonDetail.sprites.other["official-artwork"]
                      .front_default
                  }
                />
              </div>
            </div>
          </div>

          <div className="row justify-content-center pokemon-stats-wrapper">
            <div className="tabs">
              <Tabs
                id="controlled-tab-example"
                activeKey={key}
                onSelect={(k) => setKey(k)}
                className="mb-5 title-tab"
              >
                <Tab eventKey="about" title="About">
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Spesies
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {pokemonDetail.species}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Height
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {pokemonDetail.height}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Weight
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {pokemonDetail.weight}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Abilities
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {pokemonDetail.abilities}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-12">
                      <h4>Breeding</h4>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Gender
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {CapitalizeFirstLetter(pokemonDetail.gender)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Egg Groups
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {CapitalizeFirstLetter(pokemonDetail.eggGroups)}
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-xl-4 col-lg-4 col-md-4 col-sm-6 col-xs-6 title">
                      Egg Cycle
                    </div>
                    <div className="col-xl-8 col-lg-8 col-md-6 col-sm-6 col-xs-6 value">
                      {CapitalizeFirstLetter(pokemonDetail.types[0].type.name)}
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="baseState" title="Base State">
                  {pokemonDetail.stats.map((status, index) => {
                    return (
                      <div className="row mb-3" key={index}>
                        <div className="col-xl-4 col-lg-4 col-md-4 col-sm-5 col-xs-5 title">
                          {CapitalizeFirstLetter(status.stat.name)}
                        </div>
                        <div className="col-1 base-state">
                          {status.base_stat}
                        </div>
                        <div className="col-xl-7 col-lg-7 col-md-7 col-sm-5 col-xs-5 align-self-center">
                          <ProgressBar
                            variant={
                              status.base_stat >= 50 ? "success" : "danger"
                            }
                            now={status.base_stat}
                          />
                        </div>
                      </div>
                    );
                  })}
                </Tab>
                <Tab eventKey="evolutions" title="Evolutions">
                  <div className="row">
                    {evolutionsData.map((data, index) => {
                      return (
                        <div
                          className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 mb-3"
                          key={"evolutions" + index}
                        >
                          <div className="card card-move">
                            <div className="card-body">
                              <h5>{CapitalizeFirstLetter(data.name)}</h5>
                              <p className="mb-0">
                                Min Level : {data.minLevel}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Tab>
                <Tab eventKey="moves" title="Moves">
                  <div className="row">
                    {pokemonMoves.map((data, index) => {
                      return (
                        <div
                          className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 mb-3"
                          key={"moves" + index}
                        >
                          <div className="card card-move">
                            <div className="card-body">
                              <h5>{CapitalizeFirstLetter(data.name)}</h5>
                              <p className="mb-0">Accuracy : {data.accuracy}</p>
                              <p className="mb-0">Power : {data.power}</p>
                              <p className="mb-0">PP : {data.pp}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
