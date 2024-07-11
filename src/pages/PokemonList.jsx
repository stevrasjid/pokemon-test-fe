import { useEffect, useState } from "react";
import pokeballBg from "../assets/pokeballBg.png";

import axios from "axios";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "./PokemonList.scss";
import { useNavigate } from "react-router-dom";

function CapitalizeFirstLetter(data) {
  return data.charAt(0).toUpperCase() + data.slice(1);
}

export default function PokemonList() {
  const navigate = useNavigate();
  const [pokemonList, setPokemonList] = useState([]);

  const link = "https://pokeapi.co/api/v2/pokemon?offset=0&limit=12";
  const GetPokemon = async (url) => {
    try {
      const response = await axios.get(url);
      return response;
    } catch (error) {
      throw new Error(`Failed to hit API for data:`);
    }
  };
  const GetPokemonList = async () => {
    try {
      const result = await axios.get(link);
      const dataList = result.data.results;
      const promiseResult = dataList.map((data) => GetPokemon(data.url));
      try {
        var pokemonsResponse = await Promise.all(promiseResult);
        var pokemonDataList = [];
        pokemonsResponse.forEach((x) => {
          var data = x.data;
          var types = [];
          data.types.forEach((dataArray) => {
            types.push(dataArray.type.name);
          });

          var img = data.sprites.other;
          var newPokemonData = {
            name: CapitalizeFirstLetter(data.name),
            img: img,
            types: types,
            id: data.id,
          };

          pokemonDataList.push(newPokemonData);
        });

        setPokemonList(pokemonDataList);
        console.log(pokemonsResponse);
      } catch (error) {
        console.log(error);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const GoToDetail = async (id) => {
    navigate(`/pokemon/${id}`);
  };

  useEffect(() => {
    GetPokemonList();
  }, []);

  return (
    <>
      <div className="container">
        <div className="row py-4">
          <div className="col-6 text-start">
            <FontAwesomeIcon icon={faArrowLeft} className="icon-size" />
          </div>
          <div className="col-6 text-end">
            <FontAwesomeIcon icon={faBars} className="icon-size" />
          </div>
        </div>
        <h2 className="mb-3">Pokedex</h2>
        <div className="row">
          {pokemonList.map((data, index) => {
            return (
              <div
                className="col-xl-3 col-lg-4 col-md-6 col-sm-12 col-xs-12 mb-3 detail-wrapper"
                key={index}
              >
                <div
                  className={`card ${data.types[0]}`}
                  onClick={() => GoToDetail(data.id)}
                >
                  <div className="background-image-wrapper">
                    <img
                      src={pokeballBg}
                      className="background-image"
                      alt="Vite logo"
                    />
                  </div>
                  <div className="d-flex">
                    <h2>{data.name}</h2>
                  </div>
                  <div className="d-flex">
                    <div className="col">
                      <div className="d-flex flex-column content-wrapper mt-3">
                        {data.types.map((type, index2) => {
                          return (
                            <div className="type" key={"type" + index2}>
                              <p className={data.types[0]}>{type}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="col image-wrapper">
                      <img
                        src={data.img["official-artwork"].front_default}
                        className="img-fluid"
                        alt="Vite logo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
