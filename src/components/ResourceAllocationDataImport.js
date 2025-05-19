import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import axios from "axios";
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import '@progress/kendo-theme-default/dist/all.css';
import { Button } from '@progress/kendo-react-buttons';

const ResourceAllocationDataImport = () => {
    const [gridData, setGridData] = useState([]);
    const [file, setFile] = useState(null);


    
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
      };

      const handleUpload = async () => {
        if (!file) {
          alert("Please upload an Excel file.");
          return;
        }
    
        const reader = new FileReader();
        reader.onload = async (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
    
          // Assuming the first sheet is the one we want to read
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
    
          // Convert the sheet to JSON
          const formData = new FormData();
        const compressedBlob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        formData.append("file", compressedBlob, "data.xlsx");
          //const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
          try {
            // Call the REST endpoint to store the data
            

            const response = await axios.post(
                'http://localhost:8080/api/data/import-global-resource-allocation',
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
        
            console.log('Data stored successfully:', response.data);
            setGridData(response.data);
            alert('Data uploaded successfully!');
          } catch (error) {
            console.error('Error uploading data:', error);
            alert('Error uploading data.');
          }
        };

    
        reader.readAsArrayBuffer(file);
      };    

    return (
            <div>
                <h1>Resource Allocation Data Import</h1>
                <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                <Button title="Add new" themeColor={'primary'} onClick={handleUpload} type="button" style={{maxWidth:"250px"}}>
                    Upload
                </Button>
                {/* <button onClick={handleUpload}>Upload</button> */}
                <Grid data={gridData} style={{ marginTop: "20px" }}>
                    <GridColumn field="rowNum" title="Row Number" width="50px" />
                    <GridColumn field="task" title="Task" width="200px" />
                    <GridColumn field="resourceName" title="Resource Name" width="300px" />
                    <GridColumn field="projectManager" title="Project Manager" width="300px" />
                    <GridColumn field="fte" title="FTE" width="50px" />
                    <GridColumn field="shortDescription" title="Short Description" width="300px" />
                    <GridColumn field="country" title="Country" width="100px" />
                    <GridColumn field="groupName" title="Group Name" width="200px" />
                    <GridColumn field="employmentType" title="Employment Type" width="150px" />
                    <GridColumn field="state" title="State" width="100px" />
                    <GridColumn field="startDate" title="Start Date" width="120px" />
                    <GridColumn field="endDate" title="End Date" width="120px" />
                    <GridColumn field="importStatus" title="Import Status" width="150px" />
                    <GridColumn field="message" title="Message" width="300px" /> 
                </Grid>
            </div>
        );
};

export default ResourceAllocationDataImport;

