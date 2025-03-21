import React, { useEffect, useState } from 'react'
import Navbar from '../../components/Input/Navbar'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../../utils/axiosInstance';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';

const Home = () => {

    const navigate = useNavigate();

    const [userInfo, setUserInfo] = useState(null);
    const [allStories, setAllStories] = useState([]);

    // info: Get User Info
    const getUserInfo = async () => {
        try {
            
            const response = await axiosInstance.get('/get-user');
            if(response.data && response.data.user) {
                // info: Set user info if data exists
                setUserInfo(response.data.user);
            }
        } catch (error) {
            if(error.response.status === 401) {
                // info: Clear storage if unauthorized
                localStorage.clear();
                navigate('/login') // note: Redirect to login
            }
        }
    };

    // info: Get all travel stories
    const getAllTravelStories = async () => {
        try {
            const response = await axiosInstance.get('/get-all-stories');
            if(response.data && response.data.stories){
                setAllStories(response.data.stories);
            }
        } catch (error) {
            console.log("An unexpected error occured. Please try again.");
        }
    }

    // info: Handle story click
    const handleEdit = (data) => {}


    // info: Handle Travel Story Click
    const handleViewStory = (data) => {}

    // info: Handle Update Favourite
    const updateIsFavourite = async (storyData) => {}

    useEffect(() => {
        getAllTravelStories();
      getUserInfo();
    
      return () => {};
    }, [])
    

  return (
    <>
        <Navbar userInfo={userInfo} />

        <div className="container mx-auto py-10">
            <div className="flex gap-7">
                <div className="flex-1">
                    {allStories.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {allStories.map((item) => (
                                <TravelStoryCard key={item._id} 
                                    imageUrl={item.imageUrl}
                                    title={item.title}
                                    story={item.story}
                                    date={item.visitedDate}
                                    visitedLocation={item.visitedLocation}
                                    isFavourite={item.isFavourite}
                                    onEdit = {() => handleEdit(item)}
                                    onClick={() => handleViewStory(item)}
                                    onFavouriteClick={() => updateIsFavourite(item)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div>Empty Card Here</div>
                    )}
                </div>
            </div>
        </div>
    </>

  )
}

export default Home