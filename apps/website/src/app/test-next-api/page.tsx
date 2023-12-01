"use client"

import {useState} from 'react';

import { Navbar } from '@/app/components/Navigation'

// Client Component to test communication with NextJS routes and API
export default function TestNextAPI() {
  //message is the variable, setMessage is a function to set the message
  //variable and update the UI
  const [message, setMessage] = useState("Nothing yet!");
  const [dbMessage, setDBMessage] = useState("Nothing yet!");

  //talk to web servers /api route using Promise-based fetch method using GET method
  fetch("/api", {
    //options are unnecessary for simple GET request, but its
    //good to know available parameters for more complex fetches
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    },
    body: null
  }).then(async (res) => {
    //res.json() is a Promise, so use await to unwrap it
    let json = await res.json();

    //update UI with new value of message
    setMessage(JSON.stringify(json));
  }).catch((e) => {
    //update message with error message
    setMessage("Failed to get message from NextJS API route!" + e);
  });

  //set POST request to /api route
  fetch("/api", {
    method: "POST",
    
    //if body is a JSON string, set Content-Type to application/json
    headers: {
      "Content-Type": "application/json"
    },

    //pass arguments as a JSON string
    body: JSON.stringify({
      max_rows: 1
    })
  }).then(async (res) => {
    //res is the response from server
    setDBMessage(JSON.stringify(await res.json()));
  }).catch((e) => {
    setDBMessage("Post to database failed: " + e)
  });


  return (
    <main>      
      <Navbar links={[
        {name: "Request a Print", path: "/request-part"},
        {name: "Test NextJS Server Component", path: "/test-next-api/server-comp-test"}
      ]}/>
      <p>API Test {message}</p>
      <p>Database Test {dbMessage}</p>
    </main>
  )
}
