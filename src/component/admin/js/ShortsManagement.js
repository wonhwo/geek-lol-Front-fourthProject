import React, {useEffect, useState} from 'react';
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import {EnhancedTableHead, EnhancedTableToolbar, getComparator, stableSort} from "../../../utils/create-table-header";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Checkbox from "@mui/material/Checkbox";
import {formatDate} from "../../../utils/format-date";
import Button from "@mui/material/Button";
import TablePagination from "@mui/material/TablePagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import {FormControl, InputLabel, NativeSelect} from "@mui/material";
import DialogActions from "@mui/material/DialogActions";
import Slide from "@mui/material/Slide";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {SHORT_URL} from "../../../config/host-config";


const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

//테이블 헤더
const headCells = [
    {
        id: 'bnos',
        label: '글번호',
    },
    {
        id: 'titles',
        label: '글제목',
    },
    {
        id: 'posters',
        label: '글쓴이',
    },
    {
        id: 'dates',
        label: '작성일자',
    },
    {
        id: 'views',
        label: '조회수',
    },
    {
        id: 'like',
        label: '좋아요',
    },
];


const ShortsManagement = () => {
    const [shortsList,setShortsList] = useState([{
        shortsId : 1,
        title : "시발아시발",
        uploaderName : "에딩",
        uploadDate : "2015-21-64",
        viewCount : 4,
        upCount : 1
    }]);

    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const [totalPage, setTotalPage] = React.useState(1);
    const [dense, setDense] = React.useState(false);
    const [rowsPerPage, setRowsPerPage] = React.useState(10);

    const [open, setOpen] = React.useState(false);

    const shortsListFetch = async () =>{
        const res = await fetch(SHORT_URL)
        const json = await res.json()
        if (json === null)
            return

        setShortsList(json.shorts);
    }

//모달
    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };


    // 체크박스 전체 클릭
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = shortsList.map((n) => n.shortsId);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };
    const prevPageHandler= ()=>{
        if(page === 1)
            return;
        setPage(page-1)
    }
    const nextPageHandler= ()=>{
        if(totalPage === page)
            return;

        setPage(page+1)
    }
    const isSelected = (id) => selected.indexOf(id) !== -1;

    // 테이블 데이터 갯수로 줄 계산
    const emptyRows =
        page > 1 ? Math.max(0, (1 + page) * rowsPerPage - shortsList.length) : 0;

    useEffect(()=>{
        shortsListFetch()
    },[])
    return (
        <div>
            <Box sx={{ width: '65%' , mx:'auto' , mt:10}}>
                <Paper sx={{ width: '100%', mb: 2 }}>
                    <EnhancedTableToolbar numSelected={selected.length}  title={"하이라이트"}/>
                    <TableContainer>
                        <Table
                            sx={{ minWidth: 750 }}
                            aria-labelledby="tableTitle"
                            size={'medium'}
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                onSelectAllClick={handleSelectAllClick}
                                rowCount={shortsList.length}
                                headCells={headCells}
                            />
                            <TableBody>
                                {shortsList.map((row, index) => {
                                    const isItemSelected = isSelected(row.shortsId);
                                    const labelId = `enhanced-table-checkbox-${index}`;

                                    return (
                                        <TableRow
                                            hover
                                            role="checkbox"
                                            aria-checked={isItemSelected}
                                            tabIndex={-1}
                                            key={row.shortsId}
                                            selected={isItemSelected}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    onClick={(event) => handleClick(event, row.shortsId)}
                                                    color="primary"
                                                    checked={isItemSelected}
                                                    inputProps={{
                                                        'aria-labelledby': labelId,
                                                    }}
                                                />
                                            </TableCell>

                                            <TableCell align="left">{row.shortsId}</TableCell>
                                            <TableCell align="left">{row.title}</TableCell>
                                            <TableCell align="left">{row.uploaderName}</TableCell>
                                            <TableCell align="left">{formatDate(row.uploadDate,'day')}</TableCell>
                                            <TableCell align="left">{row.viewCount}</TableCell>
                                            <TableCell align="left">{row.upCount}</TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: (dense ? 33 : 53) * emptyRows,
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                                <TableRow
                                    sx={{height:20}}
                                >
                                    <TableCell colSpan={5}></TableCell>
                                    <TableCell align="right">
                                        {`${page} - ${totalPage}`}
                                    </TableCell>
                                    <TableCell >

                                        <KeyboardArrowLeftIcon color={page === 1 ? 'disabled' : 'default'}
                                                               fontSize={"small"}
                                                               onClick={prevPageHandler}
                                        />
                                        <KeyboardArrowRightIcon color={page === totalPage ? 'disabled' : 'default'} fontSize={"small"}
                                                                onClick={nextPageHandler}
                                        />
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Box>
            <React.Fragment>
                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-describedby="alert-dialog-slide-description"
                >
                    <DialogTitle>{"권한을 변경하시겠습니까?"}</DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-slide-description">
                            <FormControl fullWidth>
                                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    권한
                                </InputLabel>
                                <NativeSelect defaultValue={2}>
                                    <option value={1}>ADMIN</option>
                                    <option value={2}>COMMON</option>
                                </NativeSelect>
                            </FormControl>
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}>Cancle</Button>
                        <Button onClick={handleClose}>Ok</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        </div>
    );
};

export default ShortsManagement;