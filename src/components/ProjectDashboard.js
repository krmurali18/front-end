import React, { useEffect, useState } from 'react';
import './ProjectDashboard.css';
import { Grid, GridColumn, GridCell, GridToolbar } from '@progress/kendo-react-grid';
import '@progress/kendo-theme-default/dist/all.css';
import { Input } from '@progress/kendo-react-inputs';
import { DropDownList } from '@progress/kendo-react-dropdowns';
// Removed the commented-out conflicting import
import { Button } from '@progress/kendo-react-buttons';
import Swal from 'sweetalert2';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import { process } from '@progress/kendo-data-query';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { ExcelExport } from '@progress/kendo-react-excel-export';
import { useRef } from 'react';
 
 
const ProjectDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [data, setData] = useState([]);
  const [resourceData, setResourceData] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [dropdownData, setDropdownData] = useState([]);
  const [taskdropdownData, setTaskDropdownData] = useState([]);
  const [resourcedropdownData, setResourceDropdownData] = useState([]);
  const [selectedGroupName, setSelectedGroupName] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState([]);
  const [selectedResource, setSelectedResource] = useState([]);
  const [selectedResourceId, setSelectedResourceId] = useState([]);
  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState([]);
  const [error, setError] = useState(null);
  const [editID, setEditID] = useState(null);
  const [inEdit, setInEdit] = useState(undefined);
  const excelExportRef = useRef(null);

  const exportToExcel = () => {
    if (excelExportRef.current) {
      excelExportRef.current.save();
    }
  };

 
 
  useEffect(() => {
    fetch('http://localhost:8080/api/global-resource-allocations/', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from the API.');
        }
             
        setData(data);
        setProjects(data);
 
      })
      .catch(err => setError(err.message));
  }, []);
 
// Prepare grid data
 
 
  const handleChange = (event) => {
    const newData = projects.map(item =>
      item.mapping_id === event.dataItem.mapping_id
        ? { ...item, [event.field]: event.value }
        : item
    );
    setProjects(newData);
    setData(newData);
    //setResourceData(newData);
  };
 
  const exitEdit = () => { // New function to exit edit mode
    setEditID(null);
    setInEdit({});
  };

  const handleSaveNewRow = () => {
    const updatedInEdit = {
      ...inEdit,
      project_id: selectedProjectId,
      projectInfoEntity : inEdit.projectInfoEntity,
      group_name: selectedGroupName,
      task: selectedTask,
      resourceInfoEntity: inEdit.resourceInfoEntity,
      resource_id: selectedResourceId,
      resource_name: selectedResource,
      description: inEdit.description,
      start_date: inEdit.start_date,
      end_date: inEdit.end_date,
      allocation_percentage: inEdit.allocation_percentage,
      comments: inEdit.comments,
      source : "INSERT",
      status: "Allocated",
      inEdit: true,
      isNewItem: true,
    };

    const projectResourceMappingDTO = {
      projectId: updatedInEdit.project_id,
      groupName: updatedInEdit.group_name,
      projectInfoEntity : updatedInEdit.projectInfoEntity,
      task: updatedInEdit.task,
      resourceId: updatedInEdit.resource_id,
      resourceName: updatedInEdit.resource_name,
      resourceInfoEntity: updatedInEdit.resourceInfoEntity,
      description: updatedInEdit.description,
      start_date: updatedInEdit.start_date,
      end_date: updatedInEdit.end_date,
      allocation_percentage: updatedInEdit.allocation_percentage,
      source: updatedInEdit.source,
      comments: updatedInEdit.comments,
      status: updatedInEdit.status,
    };
    setInEdit(updatedInEdit);
    
    if (inEdit && inEdit.isNewItem) {

    fetch('http://localhost:8080/api/global-resource-allocations/addResourceAllocation', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      
      body: JSON.stringify(projectResourceMappingDTO),
    })
      .then(response => {
        if (!response.ok) {
          //alert(`Failed to save data: ${response.statusText}`);
          Swal.fire({
            icon: 'failure',
            title: 'Adding a new resource allocation failed!',
            showConfirmButton: true,
            timer: 10000
          });
          window.location.reload();
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        //alert('Data saved successfully!');
        Swal.fire({
          icon: 'success',
          title: 'Successfully added the new resource allocation!',
          showConfirmButton: true,
          timer: 10000
        });
        window.location.reload();
        return response.json();
      })
      .then(savedData => {
        setProjects(prevProjects => prevProjects.map(item => (item === inEdit ? savedData : item)));
        setEditID(null);
        setInEdit(undefined);
      })
      .catch(err => setError(err.message));
    }
  };

  const handleSave = (dataItem) => {
    console.log("dataItem",editID);
    setEditID(null);
    setInEdit(dataItem);
      // Add logic to save the updated data to the server
      if (inEdit && inEdit.isNewItem) {
        handleSaveNewRow();
      } else {
        console.log("data",data);
        const updatedDataItem = {
          ...dataItem,
    
          resource_id: inEdit.resource_id,
          allocation_percentage: inEdit.allocation_percentage,
          source:"UPDATE",
          comments: inEdit.comments,
        };

        console.log("updatedDataItem",updatedDataItem);
        fetch(`http://localhost:8080/api/global-resource-allocations/updateResourceAllocation/${editID}`, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedDataItem),
        })
          .then(response => {
            if (!response.ok) {
              alert(`Failed to update data: ${response.statusText}`);
              Swal.fire({
                icon: 'failure',
                title: 'Data update failed!',
                showConfirmButton: true,
                timer: 10000
              });
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            Swal.fire({
              icon: 'success',
              title: 'Data updated successfully!',
              showConfirmButton: true,
              timer: 10000
            });
            
            return response.json();
          })
          .then(updatedData => {
            setProjects(prevProjects => prevProjects.map(item => (item.mapping_id === editID ? updatedData : item)));
            setData(prevData => prevData.map(item => (item.mapping_id === editID ? updatedData : item)));
            exitEdit();
          })
          .catch(err => setError(err.message));
      }
  };

  const handleCancel = () => {
    // Cancel logic here
    exitEdit();
  };
 
  const handleEdit = (dataItem) => {
    console.log("DataItem:",dataItem);
    setEditID(dataItem.mapping_id);
    setInEdit(dataItem);
  };
 

//Changes for drop down
const CustomCell = (props) => {
  const { dataItem, field, onChange, dropdownOptions, isNewItem } = props;
  if (isNewItem) {
    return (
        <td>
            <DropDownList
                data={dropdownOptions}
                value={selectedGroupName}
                onChange={(e) => handleGroupNameDropdownChange(e)}
            />
        </td>
    );
  }
  return <td>{dataItem[field]}</td>;
}
 
const handleGroupNameDropdownChange = (e) => {
  const updatedData = e.target.value;
  const filteredTasks = projectData.filter(item => item.groupName === updatedData).map(item => item.task);
  
  setSelectedGroupName(updatedData);
  setInEdit((prevInEdit) => ({
    ...prevInEdit,
    group_name: updatedData,
  }));
  
  setTaskDropdownData(filteredTasks);
 
};
const ResourceCustomCell = (props) => {
  const { dataItem, field, onChange, resourcedropdownOptions, isNewItem } = props;
  //   const [resourceoptions, setResourceOptions] = useState([]);
    const isInEdit = dataItem.mapping_id === editID;
    if (isNewItem || isInEdit) {
      return (
          <td>
              <DropDownList
                  data={resourcedropdownOptions}
                  onChange={(e) => handleResourceDropDownChange(e)}
                  value={selectedResource}
              />
          </td>
      );
    }
    return <td>{dataItem[field]}</td>;
  };
 
const handleResourceDropDownChange = (event) => {
  const newData = event.target.value;
  console.log("newData in",newData);
  setSelectedResource(newData);
  
  const selectedResource = resourceData.find(
    (item) => item.resourceName === newData);
  setInEdit((prevInEdit) => ({
    ...prevInEdit,
    resourceInfoEntity: selectedResource,
    resource_name: newData,
    resource_id: selectedResource.resourceId,
  }));
  setResourceData(selectedResource);
  setSelectedResourceId(selectedResource.resourceId); 
};
 
const TaskCustomCell = (props) => {
  const { dataItem, field, onChange, taskdropdownOptions, isNewItem } = props;
   
  if (isNewItem) {
    return (
        <td>
            <DropDownList
                data={taskdropdownOptions}
                //dataItemKey="projectId"
                //textField="task"
                value={selectedTask}
                onChange={(e) => handleTaskDropDownChange(e)}
            />
        </td>
    );
  }
  return <td>{dataItem[field]}</td>;
}

const AllocationCustomCell = (props) => {
    const { dataItem, field } = props;
    const isInEdit = dataItem.mapping_id === editID;
      if (props.dataItem.isNewItem || isInEdit) {
           return (
             <td>
              <Input
                type="number"
                value={inEdit ? inEdit.allocation_percentage : ''}
                onChange={(e) => {
                const newData = e.target.value;
                setInEdit((prevInEdit) => ({
                  ...prevInEdit,
                  allocation_percentage: newData,
                }));
                }}
              />
              </td>
);
}
return <td>{dataItem[field]}</td>;}

const handleTaskDropDownChange = (e) => {
  const updatedData = e.target.value;
  setSelectedTask(updatedData);
  setInEdit((prevInEdit) => ({
    ...prevInEdit,
    task: updatedData,
  }));
  const selectedProject = projectData.find(
    (item) => item.groupName === selectedGroupName && item.task === updatedData
  );
 console.log("selectedProject",selectedProject);
  if (selectedProject) {
    setSelectedDescription(selectedProject.description);
    setSelectedProjectId(selectedProject.projectId);
    setInEdit((prevInEdit) => ({
      ...prevInEdit,
      projectInfoEntity: selectedProject,
      project_id: selectedProject.projectId,
      description: selectedProject.description
    }));
  }
  console.log("inEdit",inEdit);
};
 
useEffect(() => {
  // Fetch the dropdown data from the REST service
    fetch('http://localhost:8080/api/project-info/', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
    })
      .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          if (!Array.isArray(data)) {
            throw new Error('Invalid data format received from the API.');
          }  
          setProjectData(data);
            const distinctGroupNames = [...new Set(data.map(item => item.groupName))];
            setDropdownData(distinctGroupNames);
        })
        .catch(err => setError(err.message));
    }, []);
 
 
    useEffect(() => {
      // Fetch the dropdown data from the REST service
      fetch('http://localhost:8080/api/resource-info/', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
          })
          .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
            })
            .then(data => {
              if (!Array.isArray(data)) {
                throw new Error('Invalid data format received from the API.');
              }  
              setResourceData(data);
              setResourceDropdownData(data.map(item => item.resourceName));
            })
            .catch(err => setError(err.message));
        }, []);
   
 
  const addNew = () => {
      const newDataItem = {
        project_id :selectedProjectId,
        group_name: selectedGroupName,
        task: selectedTask,
        resource_id:'',
        resource_name: selectedResource,
        description: '',
        start_date: '',
        end_date: '',
        allocation_percentage: '',
        inEdit: true,
        isNewItem: true,
        source:'',
      };
      //setData([newDataItem, ...data]);
      setProjects([newDataItem, ...projects]);
      setEditID(newDataItem.mapping_id);
      setInEdit(newDataItem);
  };
 
 
  const gridHeight = 420;
 
  const scrollableGridStyle = {
      height: `${gridHeight}px`,
      overflow: 'auto',
  };

const [filter, setFilter] = useState({
  logic: 'and',
  filters: [],
});

const [sort, setSort] = useState([]);

const handleFilterChange = (event) => {
  setFilter(event.filter);
};

const handleSortChange = (event) => {
  setSort(event.sort);
};

const filteredData = process(projects, { filter, sort });
 
    return (
     
    <div className="dashboard-container">
        <h1>Global Resource Allocation</h1>
    <div className="project-grid-container" style={{ height: '420px', overflow: 'auto' }}>
    <ExcelExport data={projects} ref={excelExportRef}>
       <Grid 
        // style={{
        //   height: '420px',
        //   width: '1800px'
        // }}
        data={filteredData}
        sortable
        filterable
        editField="inEdit"
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onItemChange={handleChange}
        >
        <GridToolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button title="Add new" themeColor={'primary'} onClick={addNew} type="button" style={{ maxWidth: "250px" }}>
              Add new
            </Button>
            <Button title="Export to Excel" themeColor={'primary'} onClick={exportToExcel} type="button" style={{ maxWidth: "250px" }}>
              Export to Excel
            </Button>
         </GridToolbar>
{/*         <GridToolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button title="Add new" themeColor={'primary'} onClick={addNew} type="button" style={{maxWidth:"250px"}}>
            Add new
          </Button>
        </GridToolbar> */}
    {/* Move the style block to a CSS file or use inline styles */}
        <GridColumn field="group_name" title="Group Name" headerClassName=".k-grid-header"  width="120px" cell={(props) =>              
          CustomCell({
            ...props,
            dropdownOptions: dropdownData,
            isNewItem: props.dataItem.isNewItem,
          })
          } filter="text" sortable filterable={true} 
        />
 
        <GridColumn field="task" title="Task" headerClassName=".k-grid-header" width="120px" cell={(props) =>
          TaskCustomCell({
            ...props,
            taskdropdownOptions: taskdropdownData,
            isNewItem: props.dataItem.isNewItem,
          })
          } filter="text" sortable filterable={true}
        />
       
        <GridColumn field="resource_name" title="Resource Name" headerClassName=".k-grid-header" width="150px" cell={(props) =>
          ResourceCustomCell({
            ...props,
            resourcedropdownOptions: resourcedropdownData,
            isNewItem: props.dataItem.isNewItem,
          }) 
          } filter="text" sortable filterable={true}/>
        <GridColumn field="description" title="Description" headerClassName=".k-grid-header" width="150px"cell={(props) => {
          if (props.dataItem.isNewItem) {
            const selectedProject = projectData.find(
              (item) => item.groupName === selectedGroupName && item.task === selectedTask
            );
            return (
            <td>
              <Input
              value={selectedProject ? selectedProject.description : ''}
              readOnly
              />
            </td>
            );
          }
          return <td>{props.dataItem.description}</td>;
        }} filter="text" sortable filterable={true}/>
        <GridColumn field="start_date" title="Start Date" headerClassName=".k-grid-header" width="125px" cell={(props) => {
          const isInEdit = props.dataItem.mapping_id === editID;
          if (props.dataItem.isNewItem || isInEdit) {
            return (
              <td>
                {/* <DatePicker
                  value={inEdit ? new Date(inEdit.start_date) : null}
                  onChange={(e) => {
                  const newData = e.target.value;
                  setInEdit((prevInEdit) => ({
                    ...prevInEdit,
                    start_date: newData,
                  }));
                  }}
                />                */}
                <DatePicker
                    value={inEdit?.start_date ? new Date(inEdit.start_date) : null}
                    onChange={(e) => {
                      const newData = e.value instanceof Date ? e.value : null;
                      setInEdit((prevInEdit) => ({
                        ...prevInEdit,
                        start_date: newData,
                      }));
                    }}
                  />
              </td>
            );
          }
          return <td>{props.dataItem.start_date}</td>;
        }} />
        
          <GridColumn field="end_date" title="End Date" headerClassName=".k-grid-header" width="125px" cell={(props) => {
            const isInEdit = props.dataItem.mapping_id === editID;
            if (props.dataItem.isNewItem || isInEdit) {
              return (
                <td>

                  <DatePicker
                    value={inEdit?.end_date ? new Date(inEdit.end_date) : null}
                    onChange={(e) => {
                      const newData = e.value instanceof Date ? e.value : null;
                      setInEdit((prevInEdit) => ({
                        ...prevInEdit,
                        end_date: newData,
                      }));
                    }}
                  />
                </td>
              );
            }
            return <td>{props.dataItem.end_date}</td>;
          }} />
        <GridColumn field="allocation_percentage" title="% Allocation" headerClassName=".k-grid-header" width="150px" cell={(props) =>
            AllocationCustomCell({
            ...props,
            isNewItem: props.dataItem.isNewItem,
            })
          } filter="numeric" sortable filterable={true}/>
<GridColumn field="comments" title="Comments" headerClassName=".k-grid-header" width="150px" cell={(props) => {
  const isInEdit = props.dataItem.mapping_id === editID;
  if (props.dataItem.isNewItem || isInEdit) {
    return (
      <td>
        <Input
          type="text"
          value={inEdit ? inEdit.comments : ''}
          onChange={(e) => {
            const newData = e.target.value;
            setInEdit((prevInEdit) => ({
              ...prevInEdit,
              comments: newData,
            }));
          }}
        />
      </td>
    );
  }
  return <td>{props.dataItem.comments}</td>;
}} />
 <GridColumn field="source" title="Source" headerClassName=".k-grid-header" width="120px"/>
 <GridColumn field="createdAt" title="Created on" editor="date" editable={true} width="150px"/>
  <GridColumn field="createdBy" title="Created By" editor="text" editable={true} width="150px"/>
  <GridColumn field="updatedAt" title="Updated on" editor="date" editable={true} width="150px"/>
  <GridColumn field="updatedBy" title="Updated By" editor="text" editable={true} width="150px"/>
        <GridColumn headerClassName=".k-grid-header"
          width="100px" cell={(props) => (
          <td>
            {props.dataItem.mapping_id === editID ? (
            <>
              <Button onClick={() => handleSave(props.dataItem)}>Save</Button>
              <Button onClick={handleCancel}>Cancel</Button>
            </>
            ) : (
            <Button onClick={() => handleEdit(props.dataItem)}>Edit</Button>
            )}
          </td>
          )}
        />
        </Grid>
      </ExcelExport>
      </div>
      <footer className="dashboard-footer">
      <p>© 2025 Resource Allocation Dashboard. All Rights Reserved.</p>
      </footer>
    </div>
    );
};
 
export default ProjectDashboard;

// const ProjectDashboard = () => {
//   const excelExportRef = useRef(null);

//   const exportToExcel = () => {
//     if (excelExportRef.current) {
//       excelExportRef.current.save();
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <h1>Global Resource Allocation</h1>
//       <div className="project-grid-container" style={{ height: '420px', overflow: 'auto' }}>
//         <ExcelExport data={projects} ref={excelExportRef}>
//           <Grid
//             data={filteredData}
//             sortable
//             filterable
//             editField="inEdit"
//             onFilterChange={handleFilterChange}
//             onSortChange={handleSortChange}
//             onItemChange={handleChange}
//           >
//             <GridToolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
//               <Button title="Add new" themeColor={'primary'} onClick={addNew} type="button" style={{ maxWidth: "250px" }}>
//                 Add new
//               </Button>
//               <Button title="Export to Excel" themeColor={'primary'} onClick={exportToExcel} type="button" style={{ maxWidth: "250px" }}>
//                 Export to Excel
//               </Button>
//             </GridToolbar>
//             {/* Grid columns here */}
//           </Grid>
//         </ExcelExport>
//       </div>
//       <footer className="dashboard-footer">
//         <p>© 2025 Resource Allocation Dashboard. All Rights Reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default ProjectDashboard;




