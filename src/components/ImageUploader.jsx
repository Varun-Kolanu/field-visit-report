import React, { useState } from "react";

function ImageUploader({ handleImageChange, preview, edit = true, id }) {

    return (
        <div className="space-y-4">
            {
                edit ? (
                    <>
                        <h2 className="text-lg font-semibold text-gray-800">Upload a picture including all the officers and the principal</h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            required={id === undefined || id === null}
                            className="file:border file:border-gray-300 file:rounded-md file:px-4 file:py-2 file:text-sm file:cursor-pointer file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 transition"
                        />
                    </>
                ) : (
                    <h2 className="text-lg font-semibold text-gray-800">Image Uploaded:</h2>
                )
            }

            {preview && (
                <div className="flex justify-center">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full max-w-xs rounded-md shadow-md"
                    />
                </div>
            )}
        </div>
    );
}

export default ImageUploader;
