import axiosInstance from "./axiosInstance";

const UploadImage = async (imageFile) => {
    const formData = new FormData();
    // note: Append image file to form data
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post('/image-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // note:set header for file upload
            },
        });
        return response.data; // note: return the response data
    } catch (error) {
        console.error("Error Uploading the image:", error);
        throw error; // note: rethrow the error for handling in the calling function
    }
};

export default UploadImage;