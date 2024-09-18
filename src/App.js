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
  const [selectedCities, setSelectedCities] = useState([]);
  const [selectedZipCodes, setSelectedZipCodes] = useState([]);
  const [selectedAreaCodes, setSelectedAreaCodes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadingCSV, setDownloadingCSV] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || '/api';

  // Fetch contacts from the backend API with pagination, sorting, filters, and search
  const fetchContacts = (page, limit, sortColumn, sortOrder) => {
    const cityQuery = selectedCities.length > 0 ? selectedCities.join(',') : 'All';
    const zipCodeQuery = selectedZipCodes.length > 0 ? selectedZipCodes.join(',') : 'All';
    const areaCodeQuery = selectedAreaCodes.length > 0 ? selectedAreaCodes.join(',') : 'All';

    let query = `${API_URL}/contacts?page=${page}&limit=${limit}&sortColumn=${sortColumn}&sortOrder=${sortOrder}&city=${cityQuery}&zipCode=${zipCodeQuery}&areaCode=${areaCodeQuery}&category=${selectedCategory}&search=${searchQuery}`;
    
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
      .get(`${API_URL}/filters`)
      .then(response => {
        setCities(response.data.cities);
        setZipCodes(response.data.zipCodes);
        setAreaCodes(response.data.areaCodes);
        setCategories(response.data.categories);
      })
      .catch(error => {
        console.error('Error fetching filters:', error);
      });
  };

  useEffect(() => {
    fetchFilters();
    fetchContacts(currentPage, rowsPerPage, sortColumn, sortOrder);
  }, [currentPage, rowsPerPage, sortColumn, sortOrder, selectedCities, selectedZipCodes, selectedAreaCodes, selectedCategory, searchQuery]);

  // Handle sorting
  const handleSort = (column) => {
    const order = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(order);
  };

  // Handle CSV download
  const handleDownloadCSV = () => {
    setDownloadingCSV(true);

    const cityQuery = selectedCities.length > 0 ? selectedCities.join(',') : 'All';
    const zipCodeQuery = selectedZipCodes.length > 0 ? selectedZipCodes.join(',') : 'All';
    const areaCodeQuery = selectedAreaCodes.length > 0 ? selectedAreaCodes.join(',') : 'All';
    
    const query = `${API_URL}/contacts/download?city=${cityQuery}&zipCode=${zipCodeQuery}&areaCode=${areaCodeQuery}&category=${selectedCategory}&search=${searchQuery}`;

    window.open(query, '_blank');
    setDownloadingCSV(false);
  };

  // Handle multi-select change
  const handleMultiSelectChange = (event, setFunction) => {
    const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
    setFunction(selectedOptions);
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
          <select multiple value={selectedCities} onChange={(e) => handleMultiSelectChange(e, setSelectedCities)}>
            {cities.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label>ZIP Code: </label>
          <select multiple value={selectedZipCodes} onChange={(e) => handleMultiSelectChange(e, setSelectedZipCodes)}>
            {zipCodes.map((zip) => <option key={zip} value={zip}>{zip}</option>)}
          </select>
        </div>
        <div>
          <label>Area Code: </label>
          <select multiple value={selectedAreaCodes} onChange={(e) => handleMultiSelectChange(e, setSelectedAreaCodes)}>
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
            disabled={downloadingCSV}>
            {downloadingCSV ? 'Downloading...' : 'Download for goAutodial'}
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      {contacts.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('full_name')}>Full Name</th>
              <th onClick={() => handleSort('email')}>Email</th>
              <th onClick={() => handleSort('phone_number')}>Phone Number</th>
              <th onClick={() => handleSort('street_address')}>Street Address</th>
              <th onClick={() => handleSort('city')}>City</th>
              <th onClick={() => handleSort('zip_code')}>ZIP Code</th>
              <th onClick={() => handleSort('category')}>Category</th>
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

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages || totalPages === 0}>Next</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0}>Last</button>
      </div>
    </div>
  );
}

export default App;

