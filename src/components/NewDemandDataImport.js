import React, { useState } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { Button } from '@progress/kendo-react-buttons';

const NewDemandDataImport = () => {
    const [gridData, setGridData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState(null);
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
        const blob = new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        formData.append("file", blob, "data.xlsx");
          //const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
          try {
            // Call the REST endpoint to store the data
            

            const response = await axios.post(
                'http://localhost:8080/api/data/import-new-demand',
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );
        
            //const response = await axios.post('http://localhost:8080/api/data/import-new-demand', jsonData);
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
    

    // const handleFileUpload = async (event) => {

    // const file = event.target.files[0];
    // if (!file) return;

    // const reader = new FileReader();
    // reader.onload = (e) => {
    //     const data = new Uint8Array(e.target.result);
    //     const workbook = XLSX.read(data, { type: "array" });
    //     const sheetName = workbook.SheetNames[0];
    //     const sheet = workbook.Sheets[sheetName];
    //     const jsonData = XLSX.utils.sheet_to_json(sheet);
    //     // const formData = new FormData();
    //     // formData.append("file", fileData);
    //     setFileData(jsonData);
    // };
    // reader.readAsArrayBuffer(file);
    // };

    // const handleSubmit = async () => {
    //     if (!fileData) {
    //         alert("Please upload a file before submitting.");
    //         return;
    //     }

    //     const formData = new FormData();
    //     formData.append("file", fileData);
    
    //     try {
    //         setLoading(true);
    //         const response = await fetch('http://localhost:8080/api/data/import-new-demand', {
    //             method: 'POST',
    //             credentials: 'include',
    //             // headers: {
    //             //     'Accept': 'application/json',
    //             //     'Content-Type': 'application/json',
    //             // },
    //             body: formData,
    //         });

    //         //const response = await axios.post("http://localhost:8080/api/data/import-new-demand", fileData);
    //         setGridData(response.data);
    //     } catch (error) {
    //         console.error("Error importing data:", error);
    //         alert("Failed to import data. Please try again.");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div>
            <h1>New Demand Data Import</h1>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
            <Button title="Add new" themeColor={'primary'} onClick={handleUpload} type="button" style={{maxWidth:"250px"}}>
                                Upload
                            </Button>
            <Grid data={gridData} style={{ marginTop: "20px" }}>
                <GridColumn field="rowNum" title="Row Number" width="50px" />
                <GridColumn field="fte" title="FTE" width="50px"/>
                <GridColumn field="shortDescription" title="Short Description" width="300px" />
                <GridColumn field="task" title="Task" width="200px"/>
                <GridColumn field="resourcePlan" title="Resource Plan"  width="200px"/>
                <GridColumn field="demandManager" title="Demand Manager" width="200px"/>
                <GridColumn field="projectManager" title="Project Manager" width="200px"/>
                <GridColumn field="groupName" title="Group Name" width="200px"/>
                <GridColumn field="state" title="State" width="150px"/>
                <GridColumn field="portfolio" title="Portfolio" width="200px"/>
                <GridColumn field="startDate" title="Start Date" width="120px"/>
                <GridColumn field="endDate" title="End Date" width="120px"/>
                <GridColumn field="importStatus" title="Import Status" width="100px"/>
                <GridColumn field="message" title="Message" width="100px"/>
                {/* {gridData.length > 0 &&
                    Object.keys(gridData[0]).map((key) => (
                        <GridColumn key={key} field={key} title={key} />
                    ))} */}
            </Grid>
        </div>
    );
};

export default NewDemandDataImport;

// const [fileData, setFileData] = useState(null);

// const handleFileChange = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//         const data = new Uint8Array(e.target.result);
//         const workbook = XLSX.read(data, { type: "array" });
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         const jsonData = XLSX.utils.sheet_to_json(sheet);
//         setFileData(jsonData);
//     };
//     reader.readAsArrayBuffer(file);
// };

// const handleSubmit = async () => {
//     if (!fileData) {
//         alert("Please upload a file before submitting.");
//         return;
//     }

//     try {
//         setLoading(true);
//         const response = await axios.post("http://localhost:8080/api/data/import-new-demand", fileData);
//         setGridData(response.data);
//     } catch (error) {
//         console.error("Error importing data:", error);
//         alert("Failed to import data. Please try again.");
//     } finally {
//         setLoading(false);
//     }
// };



