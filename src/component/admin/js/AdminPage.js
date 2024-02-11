import React, {useState} from 'react';
import AdminHeader from "./AdminHeader";
import UserManagement from "./UserManagement";
import BoardManagement from "./BoardManagement";



const AdminPage = () => {
    //서브 메뉴 클릭한 유형 저장, 기본 : 유저관리
    const [pageType, setPageType] = useState("1");
    const changePageType=(num)=>{
        setPageType(num);
    }
    return (
        <>
            <AdminHeader pageType={pageType} changePageType={changePageType}/>
            {pageType === "1" && <UserManagement />}
            {pageType === "2" && <BoardManagement />}
        </>
    );
};

export default AdminPage;