import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { DropDownList } from '@progress/kendo-react-dropdowns';
import '@progress/kendo-theme-default/dist/all.css';
import { data } from 'react-router-dom';
import Swal from 'sweetalert2';

const DemandManagement = () => {
    const [projects, setProjects] = useState([]);
    const [resourceName, setResourceName] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedResource, setSelectedResource] = useState(null);
    const [selectedResourceEntity, setSelectedResourceEntity] = useState(null);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [months, setMonths] = useState([]);

    const formatDate = (date) => {
        const d = new Date(date);
        return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    };

    useEffect(() => {
        // Fetch projects data
        fetch('http://localhost:8080/api/project-info/get-new-projects', {
            method: 'GET',
            credentials: 'include',
            headers: {
             'Accept': 'application/json',
             'Content-Type': 'application/json',
             },
            })
            .then(response => response.json())
            .then(data => setProjects(data));

        // Fetch resources data with date range

        const startDate = '2025-01-01'; // Replace with actual start date
        const endDate = '2027-12-31'; // Replace with actual end date

        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        fetch(`http://localhost:8080/api/global-resource-allocations/monthlyResourceAllocation?startDate=${formattedStartDate}&endDate=${formattedEndDate}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(fetchedData => {
            // Extract unique months from the response
            const allMonths = new Set();

            fetchedData.forEach(resource => {
                resource.allocationDetailsDTOList?.forEach(allocation => {
                    allMonths.add(`${allocation.month.substring(0, 3)}${allocation.year}`);
                });
            });
            
            setMonths([...allMonths].sort());
            setData(fetchedData);
        })


        // fetch(`http://localhost:8080/api/global-resource-allocations/availableResources`, {
        //     method: 'GET',
        //     credentials: 'include',
        //     headers: {
        //     'Accept': 'application/json',
        //     'Content-Type': 'application/json',
        //     },
        // })
        // .then(response => response.json())
        // .then(data => setResources(data));
    }, []);

    const handleResourceSelection = (e) => {
        setResources(e.target.value);
    };
  

    const handleAssignResource = (dataItem) => {
        const assignedResource = selectedResource;
        console.log("assignedResource", assignedResource);
        if (!assignedResource || !assignedResource.resourceId) {
            alert("Please select a resource before assigning.");
            return;
        }

        //const { id: projectId, assignedResource, startDate, endDate, requiredAllocation } = props.dataItem;
        const allocationData = {
            ...dataItem,
            project_id: dataItem.projectId,
            resource_id: selectedResource.resourceId,
            projectInfoEntity: dataItem,
            resourceInfoEntity: selectedResourceEntity,
            start_date: dataItem.startDate,
            end_date: dataItem.endDate,
            allocation_percentage: dataItem.requiredAllocation,
            comments: "Allocated resource for the new demand from the demand management page",
            source : "ALLOCATED",
            status: "Allocated",
          };

        if (!assignedResource) {
            alert("Please select a resource before assigning.");
            return;
        }

        
        fetch('http://localhost:8080/api/global-resource-allocations/addResourceAllocation', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
            },
            
            body: JSON.stringify(allocationData),
          })
            .then(response => {
              if (!response.ok) {
                //alert(`Failed to save data: ${response.statusText}`);
                Swal.fire({
                    icon: 'failure',
                    title: 'Data update failed!',
                    showConfirmButton: true,
                    //timer: 10000
                });
                throw new Error(`HTTP error! Status: ${response.status}`);
              }
              //alert('Data saved successfully!');
              Swal.fire({
                icon: 'success',
                title: 'Data updated successfully!',
                showConfirmButton: true,
                //timer: 10000
            });
              return response.json();
            }).then(data => {
                //console.log('Resource assigned successfully:', data);

                //alert('Resource assigned successfully!');
                
    
            })
            .catch(err => setError(err.message));
           updateProjectStatus(dataItem);
    };

    const updateProjectStatus = (dataItem) => {

        console.log("dataItem", dataItem.projectId);
        
        fetch(`http://localhost:8080/api/project-info/update-project-status/${dataItem.projectId}?status=Allocated`, {
            method: 'POST',
            credentials: 'include',
            headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            },
        })
            .then(response => {
            if (!response.ok) {
                alert(`Failed to update project status: ${response.statusText}`);
                Swal.fire({
                icon: 'failure',
                title: 'Data update failed!',
                showConfirmButton: true,
                timer: 10000
                });
                window.location.reload();
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            Swal.fire({
                icon: 'success',
                title: 'Data updated successfully!',
                showConfirmButton: true,
                timer: 10000
            });
            window.location.reload();
            return response.json();
            })
            .catch(err => console.error('Error updating project status:', err));
    };

    // const handleResourceChange = (e, projectId) => {
    //     const selectedResource = e.target.value;
    
    //     // Update the projects state with the selected resource for the specific project
    //     const updatedProjects = projects.map(project => {
    //       if (project.id === projectId) {
    //         return { ...project, assignedResource: selectedResource };
    //       }
    //       return project;
    //     });
    
    //     setProjects(updatedProjects);
    //   };

    const handleResourceChange = (e, project, rowIndex) => {
        console.log("project", project);
        const resourceId = e.target.value.id;
        const { id: projectId, startDate, endDate, requiredAllocation } = project;
    
        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, assignedResource: e.target.value };
            }
            return p;
        });
    
        setProjects(updatedProjects);
        setSelectedProject(updatedProjects);
        setResourceName(e.target.value.resourceName);
        console.log("resourceName", e.target.value.resourceName);
        setSelectedResource(e.target.value);
        console.log("selectedResource", e.target.value.resourceId);

        fetch(`http://localhost:8080/api/resource-info/${e.target.value.resourceId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log('Resource Info:', data);
            setSelectedResourceEntity(data);
            // You can use the resource info here if needed
        })
        .catch(error => {
            console.error('Error fetching resource info:', error);
            alert('Error fetching resource info. Please try again.');
        });
    };



    return (
        <div>
            <h2>Demand Management</h2>
            <Grid data={projects}>
                <GridColumn field="groupName" title="Project Name" width="150px"/>
                <GridColumn field="task" title="Task" width="150px"/>
                <GridColumn field="requiredAllocation" title="Required Allocation Percentage" width="200px"/>
                <GridColumn field="startDate" title="Start Date" width="120px"/>
                <GridColumn field="endDate" title="End Date" width="120px"/>
                <GridColumn
                    field="assignResource"
                    title="Available Resource"
                    width="300px"
                    cell={(props) => {
                        const projectStartDate = formatDate(new Date(props.dataItem.startDate));
                        const projectEndDate = formatDate(new Date(props.dataItem.endDate));
                        const requiredAllocation = props.dataItem.requiredAllocation;     
                        const projectStartDay = new Date(projectStartDate).getDate();
                        const projectEndDay = new Date(projectEndDate).getDate();


                        
                        
                        let filteredResources = [];
                        filteredResources = Array.from(new Set(data.filter(resource => {
                            const allocationDetails = resource.allocationDetailsDTOList || [];
                            const startIndex = allocationDetails.findIndex(
                                detail => formatDate(new Date(`${detail.year}-${detail.month}-${projectStartDay}`)) === formatDate(new Date(projectStartDate))
                            );
                            const endIndex = allocationDetails.findIndex(
                                detail => formatDate(new Date(`${detail.year}-${detail.month}-${projectEndDay}`)) === formatDate(new Date(projectEndDate))
                            );

                            if (startIndex === -1 || endIndex === -1) {
                                return false; // Start or end month not found
                            }

                            for (let i = startIndex; i <= endIndex; i++) {
                                if (allocationDetails[i].totalAllocation + requiredAllocation > 1) {
                                    return false; // Not enough capacity for the required allocation
                                }
                            }

                            return true; // Resource is available for the entire range
                        }).map(resource => resource.resourceName))).map(resourceName => 
                            data.find(resource => resource.resourceName === resourceName)
                        );
                        filteredResources.sort((a, b) => a.resourceName.localeCompare(b.resourceName));
                                               
                        return (
                            <td>
                                <DropDownList
                                    data={filteredResources}
                                    textField="resourceName"
                                    value={props.dataItem.assignedResource || null}
                                    //value={filteredResources.find(resource => resource.resourceName === (props.dataItem.assignedResource?.resourceName || '')) || null}
                                    onChange={(e) => {
                                        handleResourceChange(e, props.dataItem, props.rowIndex);
                                        const selectedResourceName = e.target.value.resourceName;
                                        fetch(`http://localhost:8080/api/global-resource-allocations/resourceMonthlyAllocation?resourceName=${selectedResourceName}&startDate=${props.dataItem.startDate}&endDate=${props.dataItem.endDate}`, {
                                            method: 'GET',
                                            credentials: 'include',
                                            headers: {
                                                'Accept': 'application/json',
                                                'Content-Type': 'application/json',
                                            },
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                const allocationDetails = `
                                                    <table style="width:100%; border-collapse: collapse;">
                                                        <thead>
                                                            <tr>
                                                                <th style="border: 1px solid black; padding: 8px;">Month-Year</th>
                                                                <th style="border: 1px solid black; padding: 8px;">Total Allocation</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${data.allocationDetailsDTOList.map(allocation => `
                                                                <tr>
                                                                    <td style="border: 1px solid black; padding: 8px;">${allocation.month} ${allocation.year}</td>
                                                                    <td style="border: 1px solid black; padding: 8px;">${(allocation.totalAllocation * 100).toFixed(2)}%</td>
                                                                </tr>
                                                            `).join('')}
                                                        </tbody>
                                                    </table>
                                                `;
                                                Swal.fire({
                                                    title: `Monthly Allocation Details for ${selectedResourceName}`,
                                                    html: allocationDetails,
                                                    showConfirmButton: true,
                                                });
                                            })
                                            .catch(error => {
                                                console.error('Error fetching resource monthly allocation:', error);
                                                alert('Error fetching resource monthly allocation. Please try again.');
                                            });
                                    }}
                            
                                    //value={filteredResources.find(resource => resource.resourceName === props.dataItem.assignedResource?.resourceName) || null}
                                    //value={filteredResources.find(resource => resource.resourceName === resourceName) || null}
                                    //value={filteredResources.find(resource => resource.resourceName === (props.dataItem.assignedResource?.resourceName || '')) || null}
                                    // onChange={(e) => handleResourceChange(e, props.dataItem)}
                                    // itemRender={(li, itemProps) => (
                                    //     <a
                                    //         href="#"
                                    //         onClick={(e) => {
                                    //             fetch(`http://localhost:8080/api/global-resource-allocations/resourceMonthlyAllocation?resourceName=${itemProps.dataItem.resourceName}&startDate=${props.dataItem.startDate}&endDate=${props.dataItem.endDate}`, {
                                    //                 method: 'GET',
                                    //                 credentials: 'include',
                                    //                 headers: {
                                    //                     'Accept': 'application/json',
                                    //                     'Content-Type': 'application/json',
                                    //                 },
                                    //             })
                                    //                 .then(response => response.json())
                                    //                 .then(data => {
                                    //                     const resourceName = itemProps.dataItem.resourceName;
                                    //                     const allocationDetails = `
                                    //                         <table style="width:100%; border-collapse: collapse;">
                                    //                             <thead>
                                    //                                 <tr>
                                    //                                     <th style="border: 1px solid black; padding: 8px;">Month-Year</th>
                                    //                                     <th style="border: 1px solid black; padding: 8px;">Total Allocation</th>
                                    //                                 </tr>
                                    //                             </thead>
                                    //                             <tbody>
                                    //                                 ${data.allocationDetailsDTOList.map(allocation => `
                                    //                                     <tr>
                                    //                                         <td style="border: 1px solid black; padding: 8px;">${allocation.month} ${allocation.year}</td>
                                    //                                         <td style="border: 1px solid black; padding: 8px;">${(allocation.totalAllocation * 100).toFixed(2)}%</td>
                                    //                                     </tr>
                                    //                                 `).join('')}
                                    //                             </tbody>
                                    //                         </table>
                                    //                     `;
                                    //                     Swal.fire({
                                    //                         title: `Monthly Allocation Details for ${resourceName}`,
                                    //                         html: allocationDetails,
                                    //                         showConfirmButton: true,
                                    //                     });
                                    //                 })
                                    //                 .catch(error => {
                                    //                     console.error('Error fetching resource monthly allocation:', error);
                                    //                     alert('Error fetching resource monthly allocation. Please try again.');
                                    //                 });
                                    //             e.preventDefault();
                                    //         }}
                                    //         style={{ textDecoration: 'underline', color: 'blue' }}
                                    //     >
                                    //        <div style={{ padding: '5px', borderBottom: '1px solid #ccc' }}>
                                    //             {itemProps.dataItem.resourceName}
                                    //         </div>
                                    //     </a>
                                    // )}
                                    placeholder="Select a resource"
                                />
                            </td>
                        );
                    }}
                />
                <GridColumn
                    field="assignResourceButton"
                    title="Action"
                    width="200px"
                    cell={(props) => (
                            <td>
                                <button onClick={() => handleAssignResource(props.dataItem)}>Assign Resource</button>
                            </td>
                        )}
                />
            </Grid>
        </div>
    );

    const [monthlyAllocations, setMonthlyAllocations] = useState([]);

    useEffect(() => {
        const startDate = '2025-01-01'; // Replace with actual start date
        const endDate = '2025-12-31'; // Replace with actual end date

        fetch(`http://localhost:8080/api/global-resource-allocations/monthlyResourceAllocation?startDate=${startDate}&endDate=${endDate}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => setMonthlyAllocations(data))
        .catch(error => console.error('Error fetching monthly allocations:', error));
    }, []);

    return (
        <div>
            <h2>Monthly Resource Allocations</h2>
            <Grid data={monthlyAllocations}>
                <GridColumn field="resourceId" title="Resource ID" />
                <GridColumn field="yearMonth" title="Year-Month" />
                <GridColumn field="totalAllocation" title="Total Allocation" />
            </Grid>
        </div>
    );

};

export default DemandManagement;
