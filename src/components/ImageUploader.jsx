import React, { useState } from "react";

function ImageUploader({ handleImageChange, preview, edit = true, id }) {

    return (
        <div>
            {
                edit ? <><h2>Upload a pic including all the officers and principal</h2><input type="file" accept="image/*" onChange={handleImageChange} required={id === undefined || id === null} /></> : <h2>Image Uploaded: </h2>
            }

            {preview && <img src={preview} alt="Preview" style={{ width: "300px" }} />}
        </div>
    );
}

export default ImageUploader;
