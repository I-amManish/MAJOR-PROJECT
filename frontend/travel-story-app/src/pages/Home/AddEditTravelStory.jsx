import React, { useState } from 'react'
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from 'react-icons/md';
import DateSelector from '../../components/Input/DateSelector';
import ImageSelector from '../../components/Input/ImageSelector'

const AddEditTravelStory = ({
    storyInfo,
    type,
    onClose,
    getAllTravelStories,
}) => {

    const [title, setTitle] = useState("");
    const [storyImg, setStoryImg] = useState(null);
    const [story, setStory] = useState("");
    const [visitedLocation, setVisitedLocation] = useState([]);

    const [visitedDate, setVisitedDate] = useState(null)
    const handleAddOrUpdateClick = () => {};

    // info: Delete Story image and update the story
    const handleDeleteStoryImg = async () => {
        
    };


  return (
    <div>
        <div className='flex items-center justify-between'>
            <h5 className='text-xl font-medium text-slate-700'>
                {type === "add" ? "Add Story" : "Update Story"}
            </h5>

            <div>
                <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
                    {type === 'add' ? <button className='btn-small' onClick={() =>{}}>
                        <MdAdd className='text-lg'/> ADD STORY
                    </button> : (
                    <>
                    <button className='btn-small' onClick={handleAddOrUpdateClick}>
                        <MdUpdate className='text-lg'/> UPDATE STORY
                    </button>

                    {/* <button className='btn-small btn-delete' onClick={onClose}>
                        <MdDeleteOutline className='text-lg' />DELETE
                    </button> */}

                    </>
                    )}

                    <button 
                     className=''
                     onClick={onClose}
                     >
                        <MdClose className='text-xl text-slate-400'/>
                     </button>
                </div>
            </div>
        </div>

        <div>
            <div className='flex-1 flex flex-col gap-2 pt-4'>
                <label className='input-label'>TITLE</label>
                <input 
                    type='text'
                    className='text-2xl text-slate-950 outline-none'
                    placeholder='A Day at the Great Wall'
                    value={title}
                    onChange={({ target }) => setTitle(target.value)}
                />

                <div className='my-3'>
                    <DateSelector date={visitedDate} setDate={setVisitedDate} />
                </div>

                <ImageSelector image={storyImg} setImage={setStoryImg} handleDeleteImg={handleDeleteStoryImg} />

                <div className='flex flex-col gap-2 mt-4'>
                    <label className='input-label'>STORY</label>
                    <textarea
                        type='text'
                        className='text-sm text-slate-900 outline-none bg-slate-50 p-2 rounded'
                        placeholder='Write your story here...'
                        rows={10}
                        value={story}
                        onChange={({ target }) => setStory(target.value)}
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default AddEditTravelStory