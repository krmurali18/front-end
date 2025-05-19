import React, { useEffect, useState } from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import "@progress/kendo-theme-default/dist/all.css";
import { Button } from '@progress/kendo-react-buttons';

const ResourceMappingException = () => {
    const [data, setData] = useState([]);
    const [editID, setEditID] = useState(null);
    const [inEdit, setInEdit] = useState({});
    const [error, setError] = useState(null);

    useEffect(() => {
            fetch(`http://localhost:8080/api/resource-mapping-exception/get-latest-exceptions`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => setData(data))
            .catch(error => console.error('Error fetching the latest exceptions:', error));
        }, []);

        const handleSave = (dataItem) => {
            console.log("dataItem",dataItem);
            setEditID(dataItem.mappingId);
            setInEdit(dataItem);
        
            const updatedDataItem = {
                ...dataItem,
                allocation_percentage: dataItem.allocationPercentage,
                start_date: dataItem.startDate,
                end_date: dataItem.endDate,
                source: dataItem.source,
                resource_id: dataItem.resourceId,
                project_id: dataItem.projectId,
            };

            console.log("updatedDataItem",updatedDataItem);
        
            fetch(`http://localhost:8080/api/global-resource-allocations/updateResourceAllocation/${dataItem.mappingId}`, {
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
                        window.location.reload();
                        throw new Error(`HTTP error! Status: ${response.status}`);
                    }
                    alert(`Date updated in resource allocation successfully: ${response.statusText}`);
                    Swal.fire({
                        icon: 'success',
                        title: 'Data updated successfully!',
                        showConfirmButton: true,
                        timer: 10000
                    });
                    window.location.reload();
                    return response.json();
                })
                .then(updatedData => {
                    setData(prevData => prevData.map(item => (item.mappingId === dataItem.mappingId ? updatedData : item)));
                    exitEdit();
                })
                .catch(err => setError(err.message));
        };

        const exitEdit = () => { // New function to exit edit mode
            setEditID(null);
            setInEdit({});
          };

    return (
        <div>
            <h1>Resource Mapping Exceptions</h1>
            <div className="project-grid-container" style={{ height: '420px', overflow: 'auto' }}>
                <Grid
                    style={{
                        height: '420px',
                        width: '1800px'
                    }}
                    data={data}
                    sortable
                    filterable
                    editField="inEdit"
                >
                    <GridColumn field="groupName" title="Group Name" width="120px"/>
                    <GridColumn field="description" title="Description" width="150px"/>
                    <GridColumn field="task" title="Task" width="120px"/>
                    <GridColumn field="resourceName" title="Resource Name" width="150px"/>
                    <GridColumn field="allocationPercentage" title="% Allocation" width="120px"/>
                    <GridColumn field="startDate" title="Start Date" width="120px"/>
                    <GridColumn field="endDate" title="End Date" width="120px"/>
                    <GridColumn field="source" title="Source" width="120px"/>
                    <GridColumn field="comments" title="Comments" width="120px"/>
                    <GridColumn field="createdAt" title="Created On" width="120px"/>
                    <GridColumn field="createdBy" title="Created By" width="120px"/>
                    <GridColumn field="updatedAt" title="Updated On" width="120px"/>
                    <GridColumn field="updatedBy" title="Updated By" width="120px"/>
                    <GridColumn
                        title="Actions"
                        cell={(props) => (
                            <td>
                                <button onClick={() => handleSave(props.dataItem)}>Update Resource Mapping</button>                            
                            </td>
                        )} width="200px"
                    />
                </Grid>
            </div>
        </div>
    );
};

export default ResourceMappingException;