import React, {useEffect, useRef, useState} from 'react';
import '../scss/Shorts_content.scss'
import {BsChatLeft, BsExclamationCircle, BsHeart, BsHeartFill} from "react-icons/bs";
import cn from "classnames";
import Shorts_comment from "./Shorts_comment";
import {debounce} from "lodash";
import {SHORT_URL, SHORT_VOTE_URL} from "../../../../config/host-config";
import {getCurrentLoginUser} from "../../../../utils/login-util";
import axios from "axios";
import {json} from "react-router-dom";
import ReactPlayer from "react-player";

const ShortsContent = ({id, item, upVote}) => {
    const {shortsId, uploaderName, replyCount, viewCount, upCount, title, context} = item;
    const [token, setToken] = useState(getCurrentLoginUser().token);
    const [viewComment, setViewComment] = useState(false);


    const [viewAni, setViewAni] = useState(false);

    // 휠 애니메이션
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayCount, setDisplayCount] = useState(1);


    const [viewScrollDownAni, setViewScrollDownAni] = useState(false);
    const [viewScrollUpAni, setViewScrollUpAni] = useState(false);
    // 리스트 인덱스
    const [currentItemIndex, setCurrentItemIndex] = useState(0);
    // 휠 이벤트 시간
    const lastWheelTime = useRef(0);


    // 신고 모달 띄우기
    const [viewReport, setViewReport] = useState(false);
    const modalBackground = useRef();
    const contentRef = useRef(null);
    const isMounted = useRef(false);

    const [shortList, setShortList] = useState([]);
    // const [shortVote, setShortVote] = useState([]);
    const API_BASE_URL = SHORT_URL;
    const API_VOTE_URL = SHORT_VOTE_URL;


    const requestHeader = {
        'content-type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    //전체 upCount
    const [voteVideoState, setVoteVideoState] = useState();
    const [videoLink, setVideoLink] = useState();
    const [voteCount, setVoteCount] = useState(); // 각각의upCount
    const [voteShort, setVoteShort] = useState(false);


    // 이미지 URL을 저장할 상태변수
    const [videoUrl, setVideoUrl] = useState(null);
    const fetchShortVideo = async () => {


        const url = `http://localhost:8686/api/shorts/load-video/${shortsId}`;
        const res = await fetch(url, {
            method: "GET",
            param: shortsId
        });

        if (res.status === 200) {
            const videoData = await res.blob();

            // blob이미지를 url로 변환
            const shortUrl = window.URL.createObjectURL(videoData);

            setVideoUrl(shortUrl);
        } else {
            const errMsg = await res.text();
            alert(errMsg);
            setVideoUrl(null);
        }

    };


    useEffect(() => {
        fetchShortVideo();
    }, []);

    const getVoteVideo = async () => {
        fetch(API_BASE_URL, {
            method: 'GET',
            headers: requestHeader
        })
            .then(res => {
                // console.log(res.status);
                if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`);
                }

                return res.json();
            })
            .then(json => {

                    const startIndex = currentIndex;
                    const endIndex = Math.min(startIndex + displayCount, json.shorts.length);
                    const displayedShorts = json.shorts.slice(startIndex, endIndex);
                    setShortList(displayedShorts);
                    console.log('shorts', displayedShorts);

            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });


    };


    useEffect(() => {
        getVoteVideo();

    }, [voteCount]);

    // console.log(token);
    const patchVoteVideo = async () => {

        const res = await fetch(API_VOTE_URL, {
            method: 'PATCH',
            headers: requestHeader,
            body: JSON.stringify(shortsId)
        })
        if (res.status === 200) {
            // 예상치 못한 끝이 발생하지 않도록 비동기 처리로 변경
            const json = await res.json().catch(() => ({}));
            console.log('jsonup', json.up);
            setVoteCount(json.up);
            setVoteVideoState(item.upCount);
            console.log('upCount', voteVideoState);


        } else {
            console.error('Error:', res.status);
        }

    };

    const isEmpty = (value) => {
        return !Boolean(1);
    };

    const postVoteVideo = async (selectedShortsId) => {
        // 만약 누른 shortsId와 비교한 shrotsId가 같다면 실행되게

        // console.log('voteVideoState.isEmpty:', isEmpty(voteCount));

        if (selectedShortsId === item.shortsId) {



            const res = await fetch(API_VOTE_URL, {
                method: isEmpty(voteCount) ? 'POST' : "PATCH",
                headers: requestHeader,
                body: JSON.stringify(selectedShortsId)
            })
            if (res.status === 200) {
                // 예상치 못한 끝이 발생하지 않도록 비동기 처리로 변경
                const json = await res.json().catch(() => ({}));
                console.log('jsonup', json.up);

                setVoteCount(json.up);
                setVoteVideoState(item.upCount);
                console.log('upCount', voteVideoState);

            } else {
                console.error('Error:', res.status);
            }
        }
    }


    const voteShortVideo = (selectedShortsId) => {
        setVoteShort(!voteShort);

        if (!token) {
            alert("로그인 회원만 할수있음")
            return;
        }

        if (!voteShort) {
            patchVoteVideo();

        } else if (voteShort) {
            postVoteVideo(selectedShortsId);
        }

        // console.log('vc:', voteCount);
        // console.log('vvs:', voteVideoState);

    }


    // 댓글 닫을때 애니메이션
    useEffect(() => {
        if (isMounted.current === true) {
            setViewAni(!viewComment);

        } else if (isMounted.current === false) {
            setViewAni(false);
            isMounted.current = true;
        }
    }, [viewComment]);


    // 댓글버튼 클릭 핸들러
    const chkViewComment = e => {
        setViewComment(!viewComment);

    }


    // 휠을 내리거나 올렸을때 0.3s 기다리고 움직임
    const handleWheel = (event) => {
        const currentTime = new Date().getTime();
        // 이전 이벤트 시간 - 지금 이벤트 시간
        const deltaTime = currentTime - lastWheelTime.current;

        // 만약 0.4s이상이면 실행되도록
        if (deltaTime > 400) {
            const deltaY = event.deltaY;

            if (deltaY > 0 && currentItemIndex < shortList.length - 1) {
                setViewScrollDownAni(true);
                setTimeout(() => {
                    setViewScrollDownAni(false);
                    setCurrentItemIndex((prevIndex) => prevIndex + 1);
                }, 300);
            } else if (deltaY < 0 && currentItemIndex > 0) {
                setViewScrollUpAni(true);
                setTimeout(() => {
                    setViewScrollUpAni(false);
                    setCurrentItemIndex((prevIndex) => prevIndex - 1);
                }, 300);
            }

            lastWheelTime.current = currentTime;
        }
    };

    const handleKeyDown = (event) => {
        const currentTime = new Date().getTime();
        // 이전 이벤트 시간 - 지금 이벤트 시간
        const deltaTime = currentTime - lastWheelTime.current;

        // 만약 0.4s이상이면 실행되도록
        if (deltaTime > 400) {
            const deltaY = event.deltaY;

            if (event.keyCode === 40 && currentItemIndex < shortList.length - 1) {
                setViewScrollDownAni(true);
                setTimeout(() => {
                    setViewScrollDownAni(false);
                    setCurrentItemIndex((prevIndex) => prevIndex + 1);
                }, 300);
            } else if (event.keyCode === 38 && currentItemIndex > 0) {
                setViewScrollUpAni(true);
                setTimeout(() => {
                    setViewScrollUpAni(false);
                    setCurrentItemIndex((prevIndex) => prevIndex - 1);
                }, 300);
            }
            lastWheelTime.current = currentTime;
        }
    };

    useEffect(() => {
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('keydown', handleKeyDown); // 키다운 이벤트 추가
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown); // 이벤트 제거
        };
    }, [currentItemIndex]);



    return (
        <>
            {[item].slice(currentItemIndex, currentItemIndex + 1).map((item, shortsId) => (
                <li key={shortsId}
                    className={cn('content-container', {scrollDown_ani_view: viewScrollDownAni}, {scrollUp_ani_view: viewScrollUpAni})}
                    ref={contentRef}>
                    <div className={cn('short-form', {animation_view: viewAni})} id={'root'}>
                        <div className={cn('content', {animation_content_view: viewComment})}>
                            <video autoPlay={true} muted={true}>
                                <source src={videoUrl} type="video/mp4"/>
                            </video>
                            <div className={'overlap-front'}>
                                <div className={'produce'}>
                                    <div className={'profile_box'}>
                                        <div className={'profile-img'}>
                                            <img src={process.env.PUBLIC_URL + '/assets/test_icon2.jpg'}
                                                 alt="프로필이미지"/>
                                        </div>
                                        <div className={'profile-name'}>
                                            <p>{item.uploaderName}</p>
                                        </div>
                                    </div>
                                    <div className={'shortlist-title'}>
                                        <p className={'short-title'}>{item.title}</p>
                                    </div>
                                </div>
                                <div className={cn('front-sidebar', {front_sidebar_view: viewComment})}>
                                    <div className={'short-btn like-btn'}>
                                        {voteCount === 1 ? (
                                            <>
                                                <BsHeart className={cn('btn-none', {btn: voteShort})}
                                                         onClick={() => voteShortVideo(item.shortsId)}/>
                                                <BsHeartFill className={cn('btn-none', {btn: !voteShort})}
                                                             onClick={() => voteShortVideo(item.shortsId)}/>
                                            </>
                                        ) : (
                                            <>
                                                <BsHeart className={cn('btn-none', {btn: !voteShort})}
                                                         onClick={() => voteShortVideo(item.shortsId)}/>
                                                <BsHeartFill className={cn('btn-none', {btn: voteShort})}
                                                             onClick={() => voteShortVideo(item.shortsId)}/>
                                            </>
                                        )}
                                        <p>{voteVideoState}</p>
                                    </div>
                                    <div className={'short-btn comment-btn'}>
                                        <BsChatLeft className={'btn'} onClick={chkViewComment}/>
                                        <p>{item.replyCount}</p>
                                    </div>
                                    <div className={'short-btn report-btn'}>
                                        <BsExclamationCircle className={'btn'} onClick={() => setViewReport(true)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className={cn('sidebar', {sidebar_view: viewComment})}>
                            <div className={'short-btn like-btn'}>
                                {voteCount === 1 ? (
                                    <>
                                        <BsHeart className={cn('btn-none', {btn: voteShort})}  onClick={() => voteShortVideo(item.shortsId)}/>
                                        <BsHeartFill className={cn('btn-none', {btn: !voteShort})}
                                                     onClick={() => voteShortVideo(item.shortsId)}/>
                                    </>
                                ) : (
                                    <>
                                        <BsHeart className={cn('btn-none', {btn: !voteShort})}
                                                 onClick={() => voteShortVideo(item.shortsId)}/>
                                        <BsHeartFill className={cn('btn-none', {btn: voteShort})}
                                                     onClick={() => voteShortVideo(item.shortsId)}/>
                                    </>
                                )}
                                <p>{voteVideoState}</p>
                            </div>
                            <div className={'short-btn comment-btn'}>
                                <BsChatLeft className={'btn'} onClick={chkViewComment}/>
                                <p>{item.replyCount}</p>
                            </div>
                            <div className={'short-btn report-btn'}>
                                <BsExclamationCircle className={'btn'} onClick={() => setViewReport(true)}/>
                            </div>
                        </div>
                        <div className={cn('comment-form', {comment_form_view: viewComment})}>
                            <div className={cn("comment", {comment_view: viewComment})}>
                                <div className={'comment-wrapper'}>
                                    <Shorts_comment item={item} chkViewComment={chkViewComment}
                                                    viewComment={viewComment}/>
                                </div>
                            </div>
                        </div>
                    </div>

                    {
                        viewReport &&
                        <div className={'modal-container'} ref={modalBackground} onClick={e => {
                            if (e.target === modalBackground.current) {
                                setViewReport(false);
                            }
                        }}>
                            <div className={'modal-report'}>
                                <div className={'modal-report-text'}>
                                    <p>정말 신고하시겠습니까?</p>
                                </div>
                                <div className={'modal-btns'}>
                                    <div className={'modal-cancel-btn'} onClick={() => setViewReport(false)}>
                                        <p>취소</p>
                                    </div>
                                    <div className={'modal-correct-btn'}>
                                        <p>확인</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    }
                </li>
            ))}
        </>
    );


};

export default ShortsContent;