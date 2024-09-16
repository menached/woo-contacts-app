import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');
  const [cities, setCities] = useState([]);
  const [zipCodes, setZipCodes] = useState([]);
  const [areaCodes, setAreaCodes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedZipCode, setSelectedZipCode] = useState('All');
  const [selectedAreaCode, setSelectedAreaCode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  // Fetch contacts from the backend API with pagination, sorting, filters, and search
  const fetchContacts = (page, limit, sortColumn, sortOrder) => {
    let query = `http://localhost:5000/contacts?page=${page}&limit=${limit}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&city=${selectedCity}&zipCode=${selectedZipCode}&areaCode=${selectedAreaCode}&category=${selectedCategory}&search=${searchQuery}`;
    
    axios
      .get(query)
      .then(response => {
        setContacts(response.data.contacts);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalRecords(response.data.totalContacts);
        setErrorMessage('');  // Reset error message
      })
      .catch(error => {
        console.error('Error fetching contacts:', error);
        setErrorMessage('Failed to load contacts. Please try again later.');
      });
  };

  // Fetch filters (cities, zip codes, area codes, and categories) from the backend
  const fetchFilters = () => {
    axios
      .get('http://localhost:5000/filters')
      .then(response => {
        setCities(['All', ...response.data.cities]);
        setZipCodes(['All', ...response.data.zipCodes]);
        setAreaCodes(['All', ...response.data.areaCodes]);
        setCategories(['All', ...response.data.categories]);
      })
      .catch(error => {
        console.error('Error fetching filters:', error);
      });
  };

  useEffect(() => {
    fetchFilters();
    fetchContacts(currentPage, rowsPerPage, sortColumn, sortOrder);
  }, [currentPage, rowsPerPage, sortColumn, sortOrder, selectedCity, selectedZipCode, selectedAreaCode, selectedCategory, searchQuery]);

  // Define the handleSort function to sort the table columns
  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(order);
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    setDownloadingCSV(true);  // Set the button as busy
    const query = `http://localhost:5000/contacts/download?city=${selectedCity}&zipCode=${selectedZipCode}&areaCode=${selectedAreaCode}&category=${selectedCategory}&search=${searchQuery}`;
    
    axios({
      url: query,
      method: 'GET',
      responseType: 'blob', // important for downloading files
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_contacts.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);  // Clean up
      setDownloadingCSV(false);  // Reset after download is complete
    }).catch(error => {
      console.error('Error downloading CSV:', error);
      setDownloadingCSV(false);  // Reset even if download fails
    });
  };

  return (
    <div className="container">
      <h1 title={`Total Records: ${totalRecords}`}>Dave's goAutodial Campaign Generator</h1>

      {errorMessage && <p className="error">{errorMessage}</p>}

      {/* Filter Controls */}
      <div className="filter-controls">
        <div>
          <label>Rows per page: </label>
          <select value={rowsPerPage} onChange={(e) => setRowsPerPage(parseInt(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={1000}>1000</option>
          </select>
        </div>
        <div>
          <label>City: </label>
          <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label>ZIP Code: </label>
          <select value={selectedZipCode} onChange={(e) => setSelectedZipCode(e.target.value)}>
            {zipCodes.map((zip) => <option key={zip} value={zip}>{zip}</option>)}
          </select>
        </div>
        <div>
          <label>Area Code: </label>
          <select value={selectedAreaCode} onChange={(e) => setSelectedAreaCode(e.target.value)}>
            {areaCodes.map((areaCode) => <option key={areaCode} value={areaCode}>{areaCode}</option>)}
          </select>
        </div>
        <div>
          <label>Category: </label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </div>
        <div>
          <label>Search: </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search contacts..."
          />
        </div>

        {/* Download CSV Button */}
        <div className="download-container">
          <button 
            className="download-button" 
            onClick={handleDownloadCSV} 
            disabled={downloadingCSV}  // Disable when downloading
          >
            {downloadingCSV ? 'Downloading...' : 'Download for goAutodial'}
          </button>
        </div>
      </div>

      {/* Table with sortable columns */}
      {contacts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('full_name')}>
                Full Name {sortColumn === 'full_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortColumn === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('phone_number')}>
                Phone Number {sortColumn === 'phone_number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('street_address')}>
                Street Address {sortColumn === 'street_address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('city')}>
                City {sortColumn === 'city' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('zip_code')}>
                ZIP Code {sortColumn === 'zip_code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('category')}>
                Category {sortColumn === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
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
                <td>{contact.category}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No contacts found. Try adjusting your filters.</p>
      )}

      {/* Pagination controls */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
          First
        </button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages || 1} {/* Prevent division by 0 */}
        </span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>
          Next
        </button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>
          Last
        </button>
      </div>
    </div>
  );
}

export default App;

