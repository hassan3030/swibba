"use client"
import { useState, useEffect } from "react";
import { getAllHints, getHintByName } from "@/callAPI/static";
 const XPage = () => {
    const [hints, setHints] = useState([]);
    const [hintByName, setHintByName] = useState([]);
    const getAllHintsData = async () => {
        try {
            const response = await getAllHints();
            setHints(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }
    const getHintByNameData = async (name) => {
        try {
            const response = await getHintByName(name);
            setHintByName(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }
        useEffect(() => {
        getAllHintsData();
        getHintByNameData("swap rules");
    }, []);
  return (
    <div>
    <h1>All Hints</h1>
    <div>
      {hints.map((hint) => (
        <div key={hint.id}>{hint.title}</div>
      ))}
    </div>
    <h1>Hint by name</h1>
    <div>
      {hintByName.map((hint) => (
        <div key={hint.id}>{hint.title}</div>
      ))}
    </div>
    </div>
  )
}

export default XPage
