import React, { useState, useEffect } from 'react';
import { Grid, GridColumn } from '@progress/kendo-react-grid';
import { DatePicker } from '@progress/kendo-react-dateinputs';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';


const ResourceAllocationReport = () => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [data, setData] = useState([]);
    const [months, setMonths] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = () => {
        if (!startDate || !endDate) {
            alert("Please select both start and end dates.");
            return;
        }

        const formatDate = (date) => {
            const d = new Date(date);
            return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
        };

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

            const sortedMonths = [...allMonths].sort((a, b) => {
                const [monthA, yearA] = [a.substring(0, 3), parseInt(a.substring(3))];
                const [monthB, yearB] = [b.substring(0, 3), parseInt(b.substring(3))];
                const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                if (yearA === yearB) {
                    return monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
                }
                return yearA - yearB;
            });
            setMonths(sortedMonths);

            // Aggregate allocations for the same resource name
            const aggregatedData = fetchedData.reduce((acc, resource) => {

                const existingResource = acc.find(r => r.resourceName === resource.resourceName);
                if (existingResource) {
                    resource.allocationDetailsDTOList?.forEach(allocation => {
                        const key = `${allocation.month.substring(0, 3)}${allocation.year}`;
                        existingResource.allocationDetailsDTOList = existingResource.allocationDetailsDTOList || [];
                        const existingAllocation = existingResource.allocationDetailsDTOList.find(a => a.month === allocation.month && a.year === allocation.year);
                
                    });
                } else {
                    acc.push({ ...resource });
                }
                return acc;
            }, []);
            aggregatedData.sort((a, b) => a.resourceName.localeCompare(b.resourceName));
            
            setData(aggregatedData);
        })
        .catch(error => console.error('Error fetching monthly allocations:', error));
    };
    
    const filteredData = data.filter(resource => 
        resource.resourceName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return (
        <div>
            <h1>Global Resource Allocation Report</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <DatePicker
                    style={{ width: '150px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.value)}
                    placeholder="Start Date"
                />
                <DatePicker
                    style={{ width: '150px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.value)}
                    placeholder="End Date"
                />
                <Button onClick={fetchData}>Fetch Data</Button>
                <Input
                    style={{ width: '200px' }}
                    placeholder="Search Resource"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <Grid
            data={data.map(resource => {
                const allocationMap = {};

                resource.allocationDetailsDTOList?.forEach(allocation => {
                    const key = `${allocation.month.substring(0, 3)}${allocation.year}`;
                    allocationMap[key] = allocation.totalAllocation ; // Map allocation percentage to month-year
                });
                return {
                    resourceId: resource.resourceId,
                    resourceName: resource.resourceName,
                    ...allocationMap // Spread the allocation map to include month-year columns
                };
            })}
        >
        <GridColumn field="resourceName" title="Resource Name" width="200px"/>
        {months.map((month, idx) => (
            <GridColumn key={idx} field={month} title={month} width="120px"/> // Dynamically create columns for each month-year
        ))}
        </Grid>
        </div>
    );
};

export default ResourceAllocationReport;