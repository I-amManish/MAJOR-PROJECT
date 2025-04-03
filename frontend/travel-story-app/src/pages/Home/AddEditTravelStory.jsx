import React, { useState, useEffect } from 'react';
import { MdAdd, MdClose, MdDeleteOutline, MdUpdate } from 'react-icons/md';
import DateSelector from '../../components/Input/DateSelector';
import ImageSelector from '../../components/Input/ImageSelector';
import TagInput from '../../components/Input/TagInput';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import uploadImage from '../../utils/UploadImage';

const AddEditTravelStory = ({ storyInfo, type, onClose, getAllTravelStories }) => {
    const [title, setTitle] = useState('');
    const [storyImg, setStoryImg] = useState(null);
    const [story, setStory] = useState('');
    const [visitedLocation, setVisitedLocation] = useState([]);
    const [visitedDate, setVisitedDate] = useState(null);
    
    const [error, setError] = useState('');


    // info: Add new Travel story
    const addNewTravelStory = async () => {
        try {
            let imageUrl = "";

            // note: Upload image is exists
            if (storyImg) {
                const imageUploadRes = await uploadImage(storyImg);
                // note: Get image URL
                imageUrl = imageUploadRes.imageURL || "";
            }

            const response = await axiosInstance.post('/add-travel-story', {
                title,
                story,
                imageUrl: imageUrl || "",
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf(),
            });

            if(response.data && response.data.story) {
                toast.success("Story Added Successfully!");
                // note: Refresh Stories
                getAllTravelStories();
                // note: close modal to form
                onClose();
            }
        } catch (error) {
            
        }
    }

    // info: update Travel story
    const updateTravelStory = async () => {}

    // info: Load story info when editing
    useEffect(() => {
        if (storyInfo) {
            setTitle(storyInfo.title || '');
            setStoryImg(storyInfo.storyImg || null);
            setStory(storyInfo.story || '');
            setVisitedLocation(storyInfo.visitedLocation || []);
            setVisitedDate(storyInfo.visitedDate || null);
        }
    }, [storyInfo]);

    // info: Function to add/update a story
    const handleAddOrUpdateClick = () => {
        const storyData = { title, storyImg, story, visitedLocation, visitedDate };

        console.log('Input Data:', storyData);

        if(!title) {
            setError('Please Enter a Title');
            return;
        }

        if (!story) {
            setError('Please Enter a Story');
            return;
        }
        setError('');

        if (type === 'edit') {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    };

    // info: Delete Story image
    const handleDeleteStoryImg = () => {
        setStoryImg(null);
    };

    return (
        <div>
            <div className='flex items-center justify-between'>
                <h5 className='text-xl font-medium text-slate-700'>
                    {type === 'add' ? 'Add Story' : 'Update Story'}
                </h5>

                <div>
                    <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
                        {type === 'add' ? (
                            <button className='btn-small' onClick={handleAddOrUpdateClick}>
                                <MdAdd className='text-lg' /> ADD STORY
                            </button>
                        ) : (
                            <>
                                <button className='btn-small' onClick={handleAddOrUpdateClick}>
                                    <MdUpdate className='text-lg' /> UPDATE STORY
                                </button>
                            </>
                        )}

                        <button className='' onClick={onClose}>
                            <MdClose className='text-xl text-slate-400' />
                        </button>
                    </div>

                    {error && (
                        <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
                    )}
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

                    <div className='pt-3'>
                        <label className='input-label'>VISITED LOCATIONS</label>
                        <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEditTravelStory;
