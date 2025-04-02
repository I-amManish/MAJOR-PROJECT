import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Input/Navbar';
import axiosInstance from '../../utils/axiosInstance';
import { MdAdd } from 'react-icons/md'
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import Modal from 'react-modal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AddEditTravelStory from './AddEditTravelStory'

const Home = () => {
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type:'add',
    data:null,
  });

  // info: Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.clear();
        navigate('/login');
      }
    }
  };

  // info: Get all Travel Stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get('/get-all-stories');
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  // info: handle Update Favourite 
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;
    
    try {
      toast.success("Story Updated Successfully"); // debug: ✅ Ensure toast is shown
      const response = await axiosInstance.put(`/update-is-favourite/${storyId}`, {
        isFavourite: !storyData.isFavourite,
      });

      if (response.data && response.data.story) {
        getAllTravelStories();
      }
    } catch (error) {
      console.log("An unexpected error occurred. Please try again.");
    }
  };

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
    
    
  }, []);

  return (
    <>
      <Navbar userInfo={userInfo} />
      

      <div className='container mx-auto py-10'>
        <div className='flex gap-7'>
          <div className='flex-1'>
            {allStories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewStory(item)}
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <>Empty Card Here</>
            )}
          </div>
          <div className='w-[320px]'></div>
        </div>
      </div>

            {/* add & Edit travel story model */}
            <Modal
              isOpen={openAddEditModal.isShown}
              onRequestClose={() => {}}
              style={{
                overlay: {
                  backgroundColor: "rgba(0,0,0,0.2)",
                  zIndex: 999,
                },
              }}
              appElement={document.getElementById("root")}
              className='model-box'
              >
                <AddEditTravelStory 
                  type={openAddEditModal.type}  
                  storyInfo={openAddEditModal.data}
                  onClose={() => {
                    setOpenAddEditModal({ isShown: false, type: "add", data: null});
                  }}
                  getAllTravelStories={getAllTravelStories}
                />
              </Modal>


            <button 
              className='w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10'
              onClick={() =>{
                setOpenAddEditModal({isShown:true, type:"add", data: null});
              }}
              >
                <MdAdd className='text-[32px] text-white'/>
              </button>


      <ToastContainer /> 
    </>
  );
};

export default Home;
