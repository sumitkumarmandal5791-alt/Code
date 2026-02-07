import { useEffect } from 'react'

import { Routes, Route, Navigate } from 'react-router'
import HomePage from "./pages/HomePage";
import Login from "./pages/Login"
import Signup from "./pages/Signup"
import './App.css'
import { checkAuth } from './authSlice';
import { useDispatch, useSelector } from 'react-redux';
import ProblemEdititor from './pages/ProblemEdititor';
import Adminpage from './pages/adminHomepage';
import CreateProblem from './AdminWork/createProblem';
import UpdateProblem from './AdminWork/updateProblem';
import DeleteProblem from './AdminWork/deleteProblem';
import UpdateProblemById from './AdminWork/updateProblembyId.jsx';
import AdminCreateVideo from './AdminWork/videocreate.jsx';
import UploadVideo from "./AdminWork/uploadVideo.jsx"

function App() {

  //code
  const { isAuthentication, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch]);

  return (
    <>
      <Routes>
        <Route path="/" element={isAuthentication ? <HomePage /> : <Navigate to="/signup" />}></Route>
        <Route path="/login" element={isAuthentication ? <Navigate to="/" /> : <Login />}></Route>
        <Route path="/signup" element={isAuthentication ? <Navigate to="/" /> : <Signup />}></Route>
        {/* <Route path="/admin" element={<Adminpage />}></Route>  */}
        <Route path="/admin" element={isAuthentication && user?.role === 'admin' ? <Adminpage /> : <Navigate to="/" />}></Route>
        <Route path="/admin/create" element={isAuthentication && user?.role === 'admin' ? <CreateProblem /> : <Navigate to="/" />}></Route>
        <Route path="/admin/update" element={isAuthentication && user?.role === 'admin' ? <UpdateProblem /> : <Navigate to="/" />}></Route>
        <Route path="/admin/update/:id" element={isAuthentication && user?.role === 'admin' ? <UpdateProblemById /> : <Navigate to="/" />}></Route>
        <Route path="/admin/delete" element={isAuthentication && user?.role === 'admin' ? <DeleteProblem /> : <Navigate to="/" />}></Route>
        <Route path="/problem-editor/:id" element={<ProblemEdititor />}></Route>
        <Route path="/admin/video" element={isAuthentication && user?.role === 'admin' ? <AdminCreateVideo /> : <Navigate to="/" />}></Route>
        <Route path="/admin/uploadvideo/:problemId" element={isAuthentication && user?.role === 'admin' ? <UploadVideo /> : <Navigate to="/" />}></Route>
      </Routes>


    </>

  )
}


export default App
