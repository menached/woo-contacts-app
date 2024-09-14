import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

// Utility function to convert JSON to CSV
const jsonToCSV = (jsonArray) => {
  const csvRows = [];

  // Get the headers
  const headers = Object.keys(jsonArray[0]);
  csvRows.push(headers.join(','));

  // Loop through the rows and add them to CSV
  jsonArray.forEach(row => {
    const values = headers.map(header => {
      const escapeValue = `${row[header]}`.replace(/"/g, '""'); // Escape double quotes
      return `"${escapeValue}"`; // Enclose each value in double quotes
    });
    csvRows.push(values.join(','));
  });


  return csvRows.join('\n');
};

function App() {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Default is 10 rows per page
  const [cities, setCities] = useState(['All']); // Default "All"
  const [zipCodes, setZipCodes] = useState(['All']); // Default "All"
  const [areaCodes, setAreaCodes] = useState(['All']); // Default "All"
  const [categories, setCategories] = useState(['All']); // Default "All"
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedZipCode, setSelectedZipCode] = useState('All');
  const [selectedAreaCode, setSelectedAreaCode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState(''); // Search query
  const [totalRecords, setTotalRecords] = useState(0); // Total record count

  // Fetch contacts from the backend API with pagination, filters, and search query
  const fetchContacts = (page, limit, city, zipCode, areaCode, category, search) => {
    const query = `http://localhost:5000/contacts?page=${page}&limit=${limit}&city=${city}&zipCode=${zipCode}&areaCode=${areaCode}&category=${category}&search=${search}`;
    axios
      .get(query)
      .then(response => {
        setContacts(response.data.contacts);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalRecords(response.data.totalContacts); // Update total record count
      })
      .catch(error => {
        console.error('Error fetching contacts:', error);
      });
  };

  // Fetch unique cities, zip codes, area codes, categories, and total records for dropdown filters
  const fetchFilters = () => {
    axios
      .get('http://localhost:5000/filters')
      .then(response => {
        setCities(['All', ...response.data.cities]);
        setZipCodes(['All', ...response.data.zipCodes]);
        setAreaCodes(['All', ...response.data.areaCodes]);
        setCategories(['All', ...response.data.categories]);
        setTotalRecords(response.data.totalRecords); // Set total record count
      })
      .catch(error => {
        console.error('Error fetching filters:', error);
      });
  };

  useEffect(() => {
    fetchFilters(); // Fetch filters (unique cities, zip codes, area codes, categories, and total records) on mount
    fetchContacts(currentPage, rowsPerPage, selectedCity, selectedZipCode, selectedAreaCode, selectedCategory, searchQuery); // Fetch contacts
  }, [currentPage, rowsPerPage, selectedCity, selectedZipCode, selectedAreaCode, selectedCategory, searchQuery]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle rows per page change
  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value));
    setCurrentPage(1); // Reset to first page when changing rows per page
  };

  // Handle city change
  const handleCityChange = (event) => {
    setSelectedCity(event.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle zip code change
  const handleZipCodeChange = (event) => {
    setSelectedZipCode(event.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle area code change
  const handleAreaCodeChange = (event) => {
    setSelectedAreaCode(event.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle category change
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1); // Reset to first page when changing search query
  };


// Download the current view (all filtered records) as CSV
const handleDownloadCSV = () => {
  const query = `http://localhost:5000/contacts/download?city=${selectedCity}&zipCode=${selectedZipCode}&areaCode=${selectedAreaCode}&category=${selectedCategory}&search=${searchQuery}`;
  axios({
    url: query,
    method: 'GET',
    responseType: 'blob', // Important: This tells axios to treat the response as a blob (binary data)
  })
  .then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'contacts.csv'); // Name of the file to be downloaded
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })
  .catch(error => {
    console.error('Error downloading CSV:', error);
  });
};



  //// Download the current view (all filtered records) as CSV
  //const handleDownloadCSV = () => {
    //const query = `http://localhost:5000/contacts/download?city=${selectedCity}&zipCode=${selectedZipCode}&areaCode=${selectedAreaCode}&category=${selectedCategory}&search=${searchQuery}`;
    //axios
      //.get(query)
      //.then(response => {
        //const csv = jsonToCSV(response.data);
        //const blob = new Blob([csv], { type: 'text/csv' });
        //const url = window.URL.createObjectURL(blob);
        //const link = document.createElement('a');
        //link.href = url;
        //link.setAttribute('download', 'contacts.csv');
        //document.body.appendChild(link);
        //link.click();
        //document.body.removeChild(link);
      //})
      //.catch(error => {
        //console.error('Error downloading CSV:', error);
      //});
  //};

  return (
    <div className="container">
      <h1>Dave's Contact List Generator ({totalRecords} Total Records)</h1> {/* Updated Title */}

      {/* Filter Controls */}
      <div className="filter-controls">
        <div>
          <label>Rows per page: </label>
          <select value={rowsPerPage} onChange={handleRowsChange}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={1000}>1000</option>
          </select>
        </div>
        <div>
          <label>City: </label>
          <select value={selectedCity} onChange={handleCityChange}>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>ZIP Code: </label>
          <select value={selectedZipCode} onChange={handleZipCodeChange}>
            {zipCodes.map((zipCode) => (
              <option key={zipCode} value={zipCode}>
                {zipCode}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Area Code: </label>
          <select value={selectedAreaCode} onChange={handleAreaCodeChange}>
            {areaCodes.map((areaCode) => (
              <option key={areaCode} value={areaCode}>
                {areaCode}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Category: </label>
          <select value={selectedCategory} onChange={handleCategoryChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Search: </label>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search contacts..."
          />
        </div>

        {/* CSV Download Button */}
        <div>
          <button onClick={handleDownloadCSV}>Download as CSV</button>
        </div>
      </div>

      {/* Contacts Table */}
      <table>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Street Address</th>
            <th>City</th>
            <th>ZIP Code</th>
            <th>Area Code</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.full_name}</td>
              <td>{contact.email}</td>
              <td>{contact.phone_number}</td>
              <td>{contact.street_address}</td>
              <td>{contact.city}</td>
              <td>{contact.zip_code}</td>
              <td>{contact.phone_number.startsWith('+1') ? contact.phone_number.substring(2, 5) : contact.phone_number.substring(0, 3)}</td> {/* Extract area code */}
              <td>{contact.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
          First
        </button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
          Last
        </button>
      </div>
    </div>
  );
}

export default App;

