import React, { useState, useEffect } from 'react';
import { Grid, GridColumn, GridToolbar } from '@progress/kendo-react-grid';
import '@progress/kendo-theme-default/dist/all.css';
import { Button } from '@progress/kendo-react-buttons';
import { process } from '@progress/kendo-data-query';
 

const ProjectInfo = () => {
    const [groupName, setGroupName] = useState('');
    const [task, setTask] = useState('');
    const [description, setDescription] = useState('');
    const [skill, setSkill] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editID, setEditID] = useState(null);
    const [inEdit, setInEdit] = useState(undefined);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const projectData = {
            groupName,
            task,
            description,
            skill,
            startDate,
            endDate,
        };
        console.log("projectData", projectData);

        try {
            const response = await fetch('http://localhost:8080/api/project-info/save-project', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                //alert('Project information saved successfully!');
                //alert('Project information saved successfully!');
                const dialog = document.createElement('dialog');
                dialog.textContent = 'Project information saved successfully!';
                const okButton = document.createElement('button');
                okButton.textContent = 'OK';
                okButton.onclick = () => dialog.close();
                dialog.appendChild(okButton);
                document.body.appendChild(dialog);
                dialog.showModal();
                
            } else {
                alert('Failed to save project information.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while saving project information.');
        }
    };

    // return (
    //     <div className="projectinfo-container">
    //     {/* <header className="projectinfo-header">
    //       <img src="/eylogo.png" alt="EY Logo" className="logo" /> 
    //       <h2>Project Information</h2>
    //     </header> */}
    // <h2>Project Information</h2>
    //         <form onSubmit={handleSubmit}>
    //             <div>
    //                 <label>Group Name:</label>
    //                 <input
    //                     type="text"
    //                     value={groupName}
    //                     onChange={(e) => setGroupName(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <div>
    //                 <label>Task:</label>
    //                 <input
    //                     type="text"
    //                     value={task}
    //                     onChange={(e) => setTask(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <div>
    //                 <label>Description:</label>
    //                 <textarea
    //                     value={description}
    //                     onChange={(e) => setDescription(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <div>
    //                 <label>Skill:</label>
    //                 <input
    //                     type="text"
    //                     value={skill}
    //                     onChange={(e) => setSkill(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <div>
    //                 <label>Start Date:</label>
    //                 <input
    //                     type="date"
    //                     value={startDate}
    //                     onChange={(e) => setStartDate(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <div>
    //                 <label>End Date:</label>
    //                 <input
    //                     type="date"
    //                     value={endDate}
    //                     onChange={(e) => setEndDate(e.target.value)}
    //                     required
    //                 />
    //             </div>
    //             <button type="submit">Save Project Info</button>
    //         </form> 
    //     </div>
    // );
    const [projects, setProjects] = useState([]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/project-info/', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            } else {
                alert('Failed to fetch project information.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while fetching project information.');
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const addNew = () => {
        const newDataItem = {
            group_name: '',
            task: '',
            skill: '',
            description: '',
            start_date: '',
            end_date: ''
        };
        setProjects([newDataItem, ...projects]);
        setEditID(newDataItem.projectId);
        setInEdit(newDataItem);
    };

    const handleChange = (event) => {
    const newData = projects.map(item =>
        item.projectId === event.dataItem.projectId
        ? { ...item, [event.field]: event.value }
        : item
        );
        setProjects(newData);
        setData(newData);
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
              group_name: inEdit.group_name,
              task: inEdit.task,
              skill: inEdit.skill,
              description: inEdit.description,
              start_date: inEdit.start_date,
              end_date: inEdit.end_date,
            };
    
            console.log("updatedDataItem",updatedDataItem);
            fetch(`http://localhost:8080/api/project-info/update-project/${editID}`, {
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
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                alert('Data updated successfully!');
                return response.json();
              })
              .then(updatedData => {
                setProjects(prevProjects => prevProjects.map(item => (item.projectId === editID ? updatedData : item)));
                setData(prevData => prevData.map(item => (item.projectId === editID ? updatedData : item)));
                exitEdit();
              })
              .catch(err => setError(err.message));
          }
      };

      const exitEdit = () => { // New function to exit edit mode
        setEditID(null);
        setInEdit({});
      };

      const handleSaveNewRow = () => {
        console.log("inEdit", inEdit);
        const updatedInEdit = {
          ...inEdit,
          group_name: inEdit.group_name,
          task: inEdit.task,
          skill: inEdit.skill,
          description: inEdit.description,
          start_date: inEdit.start_date,
          end_date: inEdit.end_date,
          inEdit: true,
          isNewItem: true,
        };
    
        const projectInfoDTO = {
          groupName: updatedInEdit.group_name,
          projectInfoEntity : updatedInEdit.projectInfoEntity,
          task: updatedInEdit.task,
          description: updatedInEdit.description,
          start_date: updatedInEdit.start_date,
          end_date: updatedInEdit.end_date,
        };
        setInEdit(updatedInEdit);
        
        if (inEdit && inEdit.isNewItem) {
          console.log("updatedInEdit", updatedInEdit);
          console.log("projectResourceMappingDTO", projectResourceMappingDTO);
    
        fetch('http://localhost:8080/api/project-info/save-project', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          
          body: JSON.stringify(projectInfoDTO),
        })
          .then(response => {
            if (!response.ok) {
              alert(`Failed to save data: ${response.statusText}`);
              window.location.reload();
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            alert('Data saved successfully!');
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

      const handleEdit = (dataItem) => {
        console.log("DataItem:",dataItem);
        setEditID(dataItem.projectId);
        setInEdit(dataItem);
      };

      const handleCancel = () => {
        // Cancel logic here
        exitEdit();
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
        <div className="projectinfo-container">
                <h1>Project Information</h1>
            <div className="project-grid-container" style={{ height: '420px', overflow: 'auto' }}>
                <Grid
                    style={{
                        height: '420px',
                        width: '1800px'
                    }}
                    data={filteredData}
                    sortable
                    filterable
                    editField="inEdit"
                    onItemChange={handleChange}
                    editable="incell"
                    onSortChange={handleSortChange}
                    onFilterChange={handleFilterChange}
                >
                    <GridToolbar style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button title="Add new" themeColor={'primary'} onClick={addNew} type="button" style={{ maxWidth: "250px" }}>
                            Add new
                        </Button>
                    </GridToolbar>
                    <GridColumn field="groupName" title="Group Name" editor="text" editable={true} filter="text" sortable filterable={true} />
                    <GridColumn field="task" title="Task" editor="text" editable={true} filter="text" sortable filterable={true} />
                    {/* <GridColumn field="description" title="Description" editor="text" editable={true} /> */}
                    <GridColumn field="description" title="Description" cell={(props) => {
                    if (props.dataItem.isNewItem) {
                        return (
                        <td>
                        <Input
                        value={description ? description : ''}
                        readOnly
                        />
                        </td>
                        );
                        }
                        return <td>{props.dataItem.description}</td>;
                        }} filter="text" sortable filterable={true} />
                    <GridColumn field="startDate" title="Start Date" editor="date" editable={true}/>
                    <GridColumn field="endDate" title="End Date" editor="date" editable={true} />
                    <GridColumn field="requiredAllocation" title="Required Allocation" editor="date" editable={true} filter="numeric" sortable filterable={true}/>
                    <GridColumn field="status" title="Status" editor="text" editable={true} filter="text" sortable filterable={true} />
                    <GridColumn field="projectManager" title="Project Manager" editor="text" editable={true} filter="text" sortable filterable={true} />
                    <GridColumn field="demandManager" title="Demand Manager" editor="text" editable={true} filter="text" sortable filterable={true} />
                    <GridColumn field="createdAt" title="Created on" editor="date" editable={true} />
                    <GridColumn field="createdBy" title="Created By" editor="text" editable={true} />
                    <GridColumn field="updatedAt" title="Updated on" editor="date" editable={true} />
                    <GridColumn field="UpdatedBy" title="Updated By" editor="text" editable={true} />
                    <GridColumn
                        cell={(props) => (
                            <td>
                                {props.dataItem.projectId === editID ? (
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
            </div>
            <footer className="dashboard-footer">
                <p>© 2025 Project Info. All Rights Reserved.</p>
            </footer>
        </div>
    );
};
export default ProjectInfo;
