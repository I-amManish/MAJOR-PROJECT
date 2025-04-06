import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Input/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import { MdAdd } from 'react-icons/md';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import EmptyImg from '../../assets/images/EmptyImage.jpg';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import moment from 'moment';

const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);
  const [originalStories, setOriginalStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });

  const [loading, setLoading] = useState(false);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  const getAllTravelStories = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/get-all-stories');
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
        setOriginalStories(response.data.stories); // Save unfiltered version
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put(`/update-is-favourite/${storyId}`, {
        isFavourite: !storyData.isFavourite,
      });

      if (response.data && response.data.story) {
        toast.success('Story Updated Successfully');
        getAllTravelStories();
      }
    } catch (error) {
      toast.error('Failed to update favourite status.');
    }
  };

  const handleEdit = (data) => {
    setOpenAddEditModal({ isShown: true, type: 'edit', data });
  };

  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data });
  };

  const deleteTravelStory = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.delete(`/delete-story/${storyId}`);

      if (response.data && !response.data.error) {
        toast.error('Story Deleted Successfully');
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
        getAllTravelStories();
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get('/search', {
        params: { query },
      });

      if (response.data && response.data.stories) {
        setFilterType('search');
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log('An unexpected error occurred. Please try again.');
    }
  };

  const handleClearSearch = () => {
    setFilterType('');
    setSearchQuery('');
    setDateRange({ from: undefined, to: undefined });
    setAllStories(originalStories);
  };

  // info: Filter Stories by Date Range
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null;
      const endDate = day.to ? moment(day.to).valueOf() : null;

      if (startDate && endDate) {
        const response = await axiosInstance.get("/travel-stories/filter", {
          params: {startDate, endDate},
        });

        if (response.data && response.data.stories) {
          setFilterType("date");
          setAllStories(response.data.stories);
        }
      }
    } catch (error) {
      console.log("An unexpected error occured. Please try again.")
    }
  }

  // ✅ Handle Calendar Date Selection
  const handleDayClick = (day) => {
    setDateRange(day);
    filterStoriesByDate(day);
  };

  useEffect(() => {
    getUserInfo();
    getAllTravelStories();
  }, []);

  return (
    <>
      <Navbar
        userInfo={userInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory}
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto py-10">
        <div className="flex gap-7">
          <div className="flex-1">
            {loading ? (
              <div className="text-center text-gray-500 text-lg">Loading stories...</div>
            ) : allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onClick={() => handleViewStory(item)}
                    onFavouriteClick={() => updateIsFavourite(item)}
                    onEdit={() => handleEdit(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard
                imgSrc={EmptyImg}
                message={`Start creating your first Story! Click the 'Add' button to jot down your thoughts, ideas, and memories. Let's get started!`}
              />
            )}
          </div>

          <div className="w-[320px]">
            <div className="bg-white border border-slate-200 shadow-lg shadow-slate-200/50 rounded-lg">
              <div className="p-2">
              <DayPicker
                mode="range"
                selected={dateRange}
                onSelect={handleDayClick}
                defaultMonth={new Date()}
                captionLayout="dropdown-buttons"
                pagedNavigation
              />

              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() =>
          setOpenAddEditModal({ isShown: false, type: 'add', data: null })
        }
        style={{ overlay: { backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 999 } }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModal.type}
          storyInfo={openAddEditModal.data}
          onClose={() =>
            setOpenAddEditModal({ isShown: false, type: 'add', data: null })
          }
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() =>
          setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
        }
        style={{ overlay: { backgroundColor: 'rgba(0,0,0,0.2)', zIndex: 999 } }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
        <ViewTravelStory
          storyInfo={openViewModal.data || null}
          onClose={() =>
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
          }
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }));
            handleEdit(openViewModal.data || null);
          }}
          onDeleteClick={() => deleteTravelStory(openViewModal.data || null)}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModal({ isShown: true, type: 'add', data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />
    </>
  );
};

export default Home;
