import React, { useRef, useState, useEffect } from 'react';
import { FaRegFileImage } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';

const ImageSelector = ({ image, setImage, handleDeleteImg }) => {

  const inputRef = useRef(null)
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const onChooseFile= () =>{
    inputRef.current.click();
  };

  const handleRemoveImage = () => {
    setImage(null);
    handleDeleteImg();

  }

  useEffect(() => {
    // note: if the image is a string (URL), set it as the preview URL
    if(typeof image === 'string') {
      setPreviewUrl(image);
    } else if (image) { 
      // note: if the image is a file object, create a preivew URL
      setPreviewUrl(URL.createObjectURL(image));
    } else {
      // note: if there is no image, set the preview URL to null
      setPreviewUrl(null);  
    }
  
    return () => {
      if(previewUrl && typeof previewUrl === 'string') {
        URL.revokeObjectURL(previewUrl); // free up memory
      }
    };
  }, [image])
  

  return (
    <div>
      <input
        type='file'
        accept='image/*'
        ref={inputRef}
        onChange={handleImageChange}
        className='hidden'
      />

      {!image ? <button className='w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50' onClick={() => onChooseFile()}>

      <div className='w-14 h-4 flex items-center justify-center,bg-cyan-50 rounded-full border border-cyan-100'>
          <FaRegFileImage className='text-xl text-slate-500' />
        </div>

        <p className='text-sm text-slate-500'>Browse image files to upload</p>
      </button> : (
        <div className='w-full relative'>
          <img 
            src={previewUrl}
            alt='Selected'
            className='w-full h-[300px] object-cover rounded-lg'
          />

          <button 
            className='btn-small btn-delete absolute top-2 right-2'
            onClick={handleRemoveImage}
            >
              <MdDeleteOutline className='text-lg' />
            </button>
        </div>
      )}
        
    </div>
  )
}

export default ImageSelector