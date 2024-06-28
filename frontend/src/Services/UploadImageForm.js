import React, { useState } from 'react';
import axios from 'axios';

const UploadImageForm = ({ productId }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      console.error('No file selected!');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile); // 'image' should match the field name expected by multer
    formData.append('productId', productId);

    try {
      const response = await axios.put(`http://localhost:4000/products/${productId}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log(response.data);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="file" onChange={handleFileChange} />
      <button type="submit">Upload Image</button>
    </form>
  );
};

export default UploadImageForm;
