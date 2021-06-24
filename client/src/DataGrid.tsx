import React from "react";

import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Box from "@material-ui/core/Box";
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import CancelIcon from '@material-ui/icons/Cancel';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import FormControl from '@material-ui/core/FormControl';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from "@material-ui/core/Paper";
import Popper from '@material-ui/core/Popper';
import Select from '@material-ui/core/Select';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import TextField from '@material-ui/core/TextField';
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from '@material-ui/core/styles';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import SubdirectoryArrowRightIcon from '@material-ui/icons/SubdirectoryArrowRight';

import { useListEntriesQuery } from "./generated-api";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function DataGrid() {
  const classes = useStyles();
  const [sizeGt, setSizeGt] = React.useState(200);
  const [sizeLt, setSizeLt] = React.useState(20000);
  const [page, setPage] = React.useState(1);
  const [currentPath, setCurrentPath] = React.useState('/');
  const [open, setOpen] = React.useState(false);
  const [entryType, setEntryType] = React.useState('');
  const [nameContains, setNameContains] = React.useState('');
  const anchorRef = React.useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [history, updateHistory] = React.useState<{ id: string, path: string }[]>(
    [{
      id: '/',
      path: '/',
    }]
  );
  const options = ['Name', 'File Size >', 'File Size <', 'Type'];
  const { data, loading, error } = useListEntriesQuery({
    variables: { 
      path: currentPath, 
      page, 
      where: {
        ...(selectedIndex === 0) && {name_contains: nameContains},
        ...(selectedIndex === 1) && {size_gt: sizeGt},
        ...(selectedIndex === 2) && {size_lt: sizeLt},
        ...(selectedIndex === 3) && {type_eq: entryType}
      }
    },
  });

  React.useEffect(() => {
    setCurrentPath(history[history.length - 1].path)
  }, [history])

  const rows = React.useMemo(() => {
    const dataRows = data?.listEntries?.entries ?? [] as any

    return [
      ...(history.length > 1 
        ? [
            {
              id: history[history.length - 2].id,
              path: history[history.length - 2].path,
              name: 'UP_DIR',
              __typename: 'UP_DIR'
            }
          ]
        : []),
      ...dataRows,
    ]
  }, [history.length, data?.listEntries?.entries])

  const rowCount = React.useMemo(() => {
    const totalUpDirRows = currentPath === '/' 
      ? 0 
      : (data?.listEntries?.pagination.pageCount ?? 0) * 1
    const totalRowsFromServer = data?.listEntries?.pagination.totalRows ?? 0
    return  totalRowsFromServer + totalUpDirRows
  }, [
    data?.listEntries?.pagination.pageCount, 
    data?.listEntries?.pagination.totalRows
  ])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLLIElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    setOpen(false);
    setNameContains('');
    setEntryType('');
  };

  const handleClose = (event: React.MouseEvent<Document, MouseEvent>) => {
    if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
      return;
    }
    setOpen(false);
  };

  const handleEntryTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setEntryType(event.target.value as string);
  }

  const handleNameChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setNameContains(event.target.value as string);
  }

  const handleSizeGtChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSizeGt(Number(event.currentTarget.value));
  }

  const handleSizeLtChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSizeLt(Number(event.currentTarget.value));
  }

  const handleNameDelete = () => {
    setNameContains('');
  }

  const handleSizeGtDelete = () => {
    setSizeGt(0)
  }

  const handleSizeLtDelete = () => {
    setSizeLt(0)
  }

  return (
    <Box display="flex" height="100%">
      <Box flexGrow={1}>
        <Paper>
          <Toolbar>
            <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
              <Typography variant="h6">File Browser</Typography>
              <Box>
                <ButtonGroup
                  variant="contained"
                  color="primary"
                  size="small"
                  ref={anchorRef}
                >
                  <Button
                    color="primary"
                    size="small"
                    aria-controls={open ? 'split-button-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-label="select filter"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                  >
                    Filter By: {options[selectedIndex]}
                    <ArrowDropDownIcon />
                  </Button>
                  {selectedIndex === 0 && 
                    <TextField 
                      id="name-filter-input" 
                      variant="outlined" 
                      size="small" 
                      InputProps={{
                        endAdornment: <IconButton type="submit" aria-label="search" size="small" onClick={handleNameDelete}> 
                                        <CancelIcon />
                                      </IconButton>
                      }}
                      value={nameContains}
                      onChange={handleNameChange}
                      />
                  }
                  {selectedIndex === 1 && 
                    <TextField 
                      id="size-gt-filter-input" 
                      variant="outlined" 
                      placeholder="greater than" 
                      size="small" 
                      InputProps={{
                        type: "number",
                        endAdornment: <IconButton type="submit" aria-label="search" size="small" onClick={handleSizeGtDelete}> 
                                        <CancelIcon />
                                      </IconButton>
                      }}
                      value={sizeGt}
                      onChange={handleSizeGtChange}
                    />
                  }
                  {selectedIndex === 2 && 
                    <TextField 
                      id="size-lt-filter-input"variant="outlined" 
                      placeholder="less than" 
                      size="small" 
                      InputProps={{
                        type: "number",
                        endAdornment: <IconButton type="submit" aria-label="search" size="small" onClick={handleSizeLtDelete}> 
                                        <CancelIcon />
                                      </IconButton>
                      }}
                      value={sizeLt}
                      onChange={handleSizeLtChange}
                    />
                  }
                  {selectedIndex === 3 && 
                    <FormControl className="entry-type-dropdown" variant="outlined" >
                      <Select 
                        id="entry-type-select"
                        displayEmpty
                        value={entryType}
                        onChange={handleEntryTypeChange}
                      >
                        <MenuItem value=""><em>Directory or File</em></MenuItem>
                        <MenuItem value={"Directory"}>Directory</MenuItem>
                        <MenuItem value={"File"}>File</MenuItem>
                      </Select>
                    </FormControl>
                  }
                </ButtonGroup>
                <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal>
                  {({ TransitionProps, placement }) => (
                    <Grow
                      {...TransitionProps}
                      style={{
                        transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
                      }}
                    >
                      <Paper>
                        <ClickAwayListener onClickAway={handleClose}>
                          <MenuList id="split-button-menu">
                            {options.map((option, index) => (
                              <MenuItem
                                key={option}
                                selected={index === selectedIndex}
                                onClick={(event) => handleMenuItemClick(event, index)}
                              >
                                {option}
                              </MenuItem>
                            ))}
                          </MenuList>
                        </ClickAwayListener>
                      </Paper>
                    </Grow>
                  )}
                </Popper>
                
              </Box>
            </Box>
          </Toolbar>
          <TableContainer>
            <Table className={classes.table} size="small" aria-label="a dense table">
              <TableHead>
                <TableRow>
                  <TableCell>Path</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">Type</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({path, __typename, name, size, id }) => {
                  const isUpDir = __typename === 'UP_DIR'
                  return (
                    <TableRow key={id}>
                      <TableCell component="th" scope="row">
                        <Button
                          color="primary"
                          disabled={__typename === 'File'}
                          startIcon={isUpDir 
                            ? (<MoreHorizIcon />)
                            : (__typename === 'File' ? null : <SubdirectoryArrowRightIcon />)
                          }
                          onClick={() => {
                            updateHistory((h) => {
                              if (isUpDir && h.length > 1) {                  
                                setPage(1)
                                return [...h.splice(0, h.length - 1)]
                              } else {
                                return ([...h, { id: path, path }])
                              }
                            })
                          }}
                        >
                          {!isUpDir ? path : ''}
                        </Button>
                      </TableCell>
                      <TableCell align="right">{isUpDir ? '_' : name}</TableCell>
                      <TableCell align="right">{isUpDir ? '_' : __typename}</TableCell>
                      <TableCell align="right">{isUpDir ? '_' : size}</TableCell>
                    </TableRow>
                )})}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={rowCount}
            rowsPerPage={25}
            page={page - 1}
            onChangePage={handleChangePage}
          />
        </Paper>
      </Box>
    </Box>
  );
}

export default DataGrid;
