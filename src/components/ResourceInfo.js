import React, { useState, useEffect } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Switch } from "@progress/kendo-react-inputs";
import "@progress/kendo-theme-default/dist/all.css";
import { Button } from '@progress/kendo-react-buttons';


const ResourceInfo = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editID, setEditID] = useState(null);
    const [inEdit, setInEdit] = useState(undefined);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // const response = await fetch("http://localhost:8080/api/resource-info/");
                // const data = await response.json();
                // setResources(data);
                const response = await fetch('http://localhost:8080/api/resource-info/', {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setResources(data);
                } else {
                    alert('Failed to fetch resource information.');
                }
            } catch (error) {
                console.error("Error fetching resource info:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResources();
    }, []);


    const handleToggle = (resource) => {
        setEditID(resource.resourceId);
        const updatedResources = resources.map((res) =>
            res.resourceId === resource.resourceId ? { ...res, isActive: !res.isActive } : res
        );
        setResources(updatedResources);
        setInEdit(updatedResources);
    };

    const exitEdit = () => { // New function to exit edit mode
        setEditID(null);
        setInEdit({});
    };

    const handleSave = (dataItem) => {
        console.log("dataItem",dataItem);
        setEditID(null);
        setInEdit(dataItem);
          // Add logic to save the updated data to the server
        const updatedDataItem = {
            ...dataItem,
            resourceName: inEdit.resourceName,
            employeeType: inEdit.employeeType,
            country: inEdit.country,
            isActive: inEdit.active,
            superUser: inEdit.superUser,
        };

        console.log("updatedDataItem",updatedDataItem);
        fetch(`http://localhost:8080/api/resource-info/updateResource/${editID}`, {
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
      };
    
      const handleCancel = () => {
        // Cancel logic here
        exitEdit();
      };
     
      const handleEdit = (dataItem) => {
        console.log("DataItem:",dataItem);
        setEditID(dataItem.resourceId);
        const updatedResources = resources.map(employee => {
            if (employee.resourceId === dataItem.resourceId) {
                return { ...employee, isActive: !employee.active, superUser: employee.superUser }; // Toggle the active status
            }
            return employee;
        });
        setResources(updatedResources);
        setInEdit(updatedResources);
    };

    const toggleActiveStatus = (resourceId) => {
        console.log("Resource ID:", resourceId);
        setEditID(resourceId);
        const updatedResources = resources.map(employee => {
            if (employee.resourceId === resourceId) {
                return { ...employee, active: !employee.active }; // Toggle the active status
            }
            return employee;
        });
        setResources(updatedResources); // Update the state with the new data
        setInEdit(updatedResources);
    };

    const toggleSwitch = (employee) => (
        <Switch
            checked={employee.active}
            onChange={() => toggleActiveStatus(employee.resourceId)}
        />
    );
    // Toggles the superUser flag for a given resource
    const handleSuperUserToggle = (resourceId) => {
        setEditID(resourceId);
        const updatedResources = resources.map(employee => {
            if (employee.resourceId === resourceId) {
                return { ...employee, superUser: !employee.superUser };
            }
            return employee;
        });
        setResources(updatedResources);
        setInEdit(updatedResources);
    };

    const toggleSuperUserFlag = (employee) => (
        <Switch
            checked={employee.superUser}
            onChange={() => handleSuperUserToggle(employee.resourceId)}
        />
    );

    const toggleSuperUserStatus = (resourceId) => {
        console.log("Resource ID:", resourceId);
        setEditID(resourceId);
        const updatedResources = resources.map(employee => {
            if (employee.resourceId === resourceId) {
                return { ...employee, superUser: !employee.superUser }; // Toggle the active status
            }
            return employee;
        });
        setResources(updatedResources); // Update the state with the new data
        setInEdit(updatedResources);
    };

    const editButton = (employeeId) => (
        <Button onClick={() => toggleActiveStatus(employeeId)}>
            Edit
        </Button>
    );

    return (
        <div>
            <h1>Resource Info</h1>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Grid
                    data={resources}
                    sortable
                    filterable
                    style={{ height: "400px" }}
                >
                    <GridColumn field="resourceName" title="Resource Name" />
                    <GridColumn field="employeeType" title="Employee Type" />
                    <GridColumn field="country" title="Country" />
                    <GridColumn field="createdBy" title="Created By" />
                    <GridColumn field="createdAt" title="Created At" />
                    <GridColumn field="updatedBy" title="Updated By" />
                    <GridColumn field="updatedAt" title="Updated At" />
                    
                    {/* <GridColumn
                        field="active"
                        title="Active"
                        editor="boolean"
                        cell={(props) => (
                            <td>
                                {props.dataItem.resourceId === editID ? (
                                    <Switch
                                        checked={inEdit?.active || false}
                                        onChange={(e) =>
                                            handleToggle(props.dataItem.active)
                                            //setInEdit({ ...inEdit, active: e.target.value })
                                        }
                                    />
                                ) : (
                                    <Switch
                                        checked={props.dataItem.active}
                                        disabled
                                    />
                                )}
                            </td>
                        )}
                    /> */}
                    <GridColumn field="active" title="Active" cell={props => (
                         <td>{toggleSwitch(props.dataItem)}</td>
                    )} />


                     <GridColumn field="superUser" title="Super User" cell={props => (
                         <td>{toggleSuperUserFlag(props.dataItem)}</td>
                    )} />
                    {/* <GridColumn
                        field="active"
                        title="Active"
                        cell={(props) => (
                            <td>
                                <Switch
                                    checked={props.dataItem.active}
                                    onChange={() => handleToggle(props.dataItem)}
                                />
                            </td>
                        )}
                    /> */}

                    {/* <GridColumn title="Actions" cell={props => editButton(props.dataItem.id)} /> */}

                    <GridColumn headerClassName=".k-grid-header"
                          width="100px" cell={(props) => (
                          <td>
                            {props.dataItem.resourceId === editID ? (
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
            )}
        </div>
    );
};

export default ResourceInfo;