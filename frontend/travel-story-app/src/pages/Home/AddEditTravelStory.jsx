import React, { useState } from 'react';
import { MdAdd, MdClose, MdUpdate } from 'react-icons/md';
import DateSelector from '../../components/Input/DateSelector';
import ImageSelector from '../../components/Input/ImageSelector';
import TagInput from '../../components/Input/TagInput';
import moment from 'moment';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import uploadImage from '../../utils/UploadImage';

const AddEditTravelStory = ({ storyInfo, type, onClose, getAllTravelStories }) => {
    const [title, setTitle] = useState(storyInfo?.title || "");
    const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl || null);
    const [story, setStory] = useState(storyInfo?.story || "");
    const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApiError = (error) => {
        if (error.response?.data?.message) {
            setError(error.response.data.message);
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
    };

    // Add new story
    const addNewTravelStory = async () => {
        setLoading(true);
        try {
            let imageUrl = "";

            if (storyImg && typeof storyImg !== "string") {
                const imgUploadRes = await uploadImage(storyImg);
                imageUrl = imgUploadRes.imageUrl || "";
            }

            const response = await axiosInstance.post("/add-travel-story", {
                title,
                story,
                imageUrl,
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf()
            });

            if (response.data?.story) {
                toast.success("Story Added Successfully");
                getAllTravelStories();
                onClose();
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    // info: Update story
    const updateTravelStory = async () => {
        setLoading(true);
        try {
            const storyId = storyInfo._id;
            let imageUrl = storyInfo.imageUrl;

            if (storyImg && typeof storyImg !== "string") {
                const imgUploadRes = await uploadImage(storyImg);
                imageUrl = imgUploadRes.imageUrl || "";
            }

            let postData = {
                title,
                story,
                imageUrl,
                visitedLocation,
                visitedDate: visitedDate
                    ? moment(visitedDate).valueOf()
                    : moment().valueOf()
            };

            const response = await axiosInstance.put(`/edit-story/${storyId}`, postData);

            if (response.data?.story) {
                toast.success("Story Updated Successfully");
                getAllTravelStories();
                onClose();
            }
        } catch (error) {
            handleApiError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrUpdateClick = () => {
        if (!title) {
            setError("Please enter a title.");
            return;
        }
        if (!story) {
            setError("Please enter a story.");
            return;
        }

        setError("");

        if (type === 'edit') {
            updateTravelStory();
        } else {
            addNewTravelStory();
        }
    };

    // info: Delete story image and update the story
    const handleDeleteStoryImg = async () => {
        // note: Delete the image
        const deleteImageRes = await axiosInstance.delete("/delete-image", {
            params: {
                imageUrl: storyInfo.imageUrl,
            },
        });

        if(deleteImageRes.data) {
            const storyId = storyInfo._id;

            const postData = {
                title,
                story,
                visitedLocation,
                visitedDate: moment().valueOf(),
                imageUrl:"",
            };
            // note: Updating story
            const response = await axiosInstance.put(
                "/edit-story/" + storyId, postData
            );
            setStoryImg(null);
        }
        
    };

    return (
        <div className='relative'>
            <div className='flex items-center justify-between'>
                <h5 className='text-xl font-medium text-slate-700'>
                    {type === 'add' ? 'Add Story' : 'Update Story'}
                </h5>

                <div>
                    <div className='flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg'>
                        <button
                            className='btn-small'
                            onClick={handleAddOrUpdateClick}
                            disabled={loading}
                        >
                            {type === "add" ? (
                                <>
                                    <MdAdd className='text-lg' /> ADD STORY
                                </>
                            ) : (
                                <>
                                    <MdUpdate className='text-lg' /> UPDATE STORY
                                </>
                            )}
                        </button>

                        <button onClick={onClose}>
                            <MdClose className='text-xl text-slate-400' />
                        </button>
                    </div>

                    {error && (
                        <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
                    )}
                </div>
            </div>

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

                <ImageSelector
                    image={storyImg}
                    setImage={setStoryImg}
                    handleDeleteImg={handleDeleteStoryImg}
                />

                <div className='flex flex-col gap-2 mt-4'>
                    <label className='input-label'>STORY</label>
                    <textarea
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
    );
};

export default AddEditTravelStory;
