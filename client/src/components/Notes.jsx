
import { useEffect, useState } from "react"
import Note from "./Note";

const Notes = () => {

    const [notes, setNotes] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);


    const baseURL = 'http://localhost:3000'

    // useEffect (() => {
    //     // const fetchData = async () => {
    //     //     try {
    //     //         const response = await fetch(`${baseURL}/note/`);
    //     //         if (response.ok) {
    //     //             const data = await response.json()
    //     //             setNotes(data.notes)
    //     //         } else {
    //     //             console.log("Failed to fetch notes");
    //     //         }
    //     //     } catch (error) {
    //     //         console.log("Error fetching data", error);
    //     //     }
    //     // }
    //     // fetchData()
    //     // console.log([notes])
    //     setNotes([{
    //         "title": "P2P Peer-to-Peer",
    //         "url": "https://msfthack.blob.core.windows.net/notes/09bbfb79-7636-4e95-9734-733328c63143_all_pages.png",
    //         "summary": "P2P Peer-to-peer In client server, we have a dedicated server, and multiple clients Each host acts as a client and a server All machines in a P2P is a node in the network Ex. . Unstructured P2P network . Data is sent without regard to who is receiving it Not talking about unstructured P2P in this class Structured P2P networks have a way to find files Distributed Hash Tables Distributed Hash Table Instead of having a slot, you store it on another machine >Want to have redundant information in case a node leaves the system 0 Used to keep track of the files in a P2P system (distributed tracking of files) Can co-exist with a traditional tracker (more on this later) Tracker is the central authority Linear Searching of Hashed Nodes (Basic Hashing Nodes) Store item in the successor of the nodes key 00000 Hashing is random, evenly distributed key space Each node maintains its successor Can find any data time Linear performance . Central authority helps people find peers, but once you're in the network it's unstructured . Tracker provides information on the file, and many of the nodes that have part of that file This information is then used for those peers to communicate to share the parts of the file Model favored by most P2P networks"
    //     },
    //     {
    //         "title": "MongoDB — Document Based Query",
    //         "url": "https://msfthack.blob.core.windows.net/notes/41f8797f-fbb7-4259-91d9-d9b32e1dde7c_all_pages.png",
    //         "summary": "Can query on any attribute, as opposed to just the key There is no standard for Document Based Our benchmark will be MongoDB MONGODB Used BSON for file formats (binary JSON) . Hierarchy is Database -> Collection -> Documents Collection is a bunch of related documents Not every document needs to have the same attributes (this can be a problem) MONGO SECURITY Mongo by default does not have usernames and passwords ... There is no checking for schema Every document is created with an_id attribute. Ex: db.products.find({available_quantity: {$It: 100}}, {name: 1}) Gets all documents with a quantity less than 100, and projects just the name and _id Ex: db. < collectionName>.updateMany() Ex: db.products.updateOne({Name: \"Smith\"}, {$set: {age: 34}}) First document is the find piece of the update Second document is what you want to update Be sure to include $set, otherwise, it will set the entire document that matched to the criteria in the 2nd document Use db ."
    //     }
    // ])
    //     console.log("refresh")
    // }, []);
    
    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const uploadFile = async (event) => {
        event.preventDefault();
    
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
    
            const response = await fetch(`${baseURL}/note/upload`, {
                method: "POST",
                body: formData,
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log(result);
            } else {
                console.error("Failed to upload file. Status:", response.status);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
      };

    return (
        <div>
        <h2>File Upload</h2>
        <form onSubmit={uploadFile}>
            <label>
            Choose a file:
            <input type="file" onChange={handleFileChange} />
            </label>
            <br />
            <button type="submit">Upload</button>
        </form>
        </div>
    )
}

export default Notes