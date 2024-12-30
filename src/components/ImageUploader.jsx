import axios from "axios";
import React, { useState } from "react";

function ImageUploader() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploadedUrl, setUploadedUrl] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const uploadToImgBB = async (imageFile) => {
        const formData = new FormData();
        formData.append("image", imageFile);

        const response = await axios.post(`https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMAGEBB_API_KEY}`, formData);

        return response.data.display_url
    };

    const handleUpload = async () => {
        if (image) {
            try {
                const url = await uploadToImgBB(image);
                setUploadedUrl(url);
                console.log("Uploaded Image URL:", url);
            } catch (error) {
                console.error("Error uploading", error)
            }
        }
    };

    return (
        <div>
            <h1>Upload an Image</h1>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {preview && <img src={preview} alt="Preview" style={{ width: "200px" }} />}
            <button onClick={handleUpload}>Upload</button>
            {uploadedUrl && (
                <p>
                    Image uploaded! View it <a href={uploadedUrl} target="_blank" rel="noreferrer">here</a>.
                </p>
            )}
        </div>
    );
}

export default ImageUploader;
