import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [contacts, setContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [cities, setCities] = useState(['All']);
  const [zipCodes, setZipCodes] = useState(['All']);
  const [areaCodes, setAreaCodes] = useState(['All']);
  const [categories, setCategories] = useState(['All']);
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedZipCode, setSelectedZipCode] = useState('All');
  const [selectedAreaCode, setSelectedAreaCode] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchContacts = (page, limit, city, zipCode, areaCode, category, search) => {
    const query = `http://localhost:5000/contacts?page=${page}&limit=${limit}&city=${city}&zipCode=${zipCode}&areaCode=${areaCode}&category=${category}&search=${search}`;
    axios
      .get(query)
      .then(response => {
        setContacts(response.data.contacts);
        setTotalPages(response.data.totalPages);
        setCurrentPage(response.data.currentPage);
        setTotalRecords(response.data.totalContacts);
      })
      .catch(error => {
        console.error('Error fetching contacts:', error);
      });
  };

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
    fetchContacts(currentPage, rowsPerPage, selectedCity, selectedZipCode, selectedAreaCode, selectedCategory, searchQuery);
  }, [currentPage, rowsPerPage, selectedCity, selectedZipCode, selectedAreaCode, selectedCategory, searchQuery]);

  const handleDownloadCSV = () => {
    const query = `http://localhost:5000/contacts/download?city=${selectedCity}&zipCode=${selectedZipCode}&areaCode=${selectedAreaCode}&category=${selectedCategory}&search=${searchQuery}`;
    axios({
      url: query,
      method: 'GET',
      responseType: 'blob',
    }).then(response => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'filtered_contacts.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }).catch(error => {
      console.error('Error downloading CSV:', error);
    });
  };

  return (
    <div className="container">
      {/* Title with Tooltip */}
      <h1 title={`Total Records: ${totalRecords}`}>Dave's Contact List Generator</h1>

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
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div>
          <label>ZIP Code: </label>
          <select value={selectedZipCode} onChange={(e) => setSelectedZipCode(e.target.value)}>
            {zipCodes.map(zip => <option key={zip} value={zip}>{zip}</option>)}
          </select>
        </div>
        <div>
          <label>Area Code: </label>
          <select value={selectedAreaCode} onChange={(e) => setSelectedAreaCode(e.target.value)}>
            {areaCodes.map(areaCode => <option key={areaCode} value={areaCode}>{areaCode}</option>)}
          </select>
        </div>
        <div>
          <label>Category: </label>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
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
        <div>
          <button className="download-button" onClick={handleDownloadCSV}>Download as CSV</button>
        </div>
      </div>

      {/* Top Pagination Controls - Only show buttons, hide page numbers */}
      <div className="pagination top-pagination">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        {/* Hide page number display here */}
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
      </div>

      {/* Contacts Table */}
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort('full_name')}>Full Name {sortColumn === 'full_name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('email')}>Email {sortColumn === 'email' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('phone_number')}>Phone Number {sortColumn === 'phone_number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('street_address')}>Street Address {sortColumn === 'street_address' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('city')}>City {sortColumn === 'city' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('zip_code')}>ZIP Code {sortColumn === 'zip_code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('area_code')}>Area Code {sortColumn === 'area_code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
            <th onClick={() => handleSort('category')}>Category {sortColumn === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map(contact => (
            <tr key={contact.id}>
              <td>{contact.full_name}</td>
              <td>{contact.email}</td>
              <td>{contact.phone_number}</td>
              <td>{contact.street_address}</td>
              <td>{contact.city}</td>
              <td>{contact.zip_code}</td>
              <td>{contact.phone_number.startsWith('+1') ? contact.phone_number.substring(2, 5) : contact.phone_number.substring(0, 3)}</td>
              <td>{contact.category}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Bottom Pagination Controls */}
      <div className="pagination bottom-pagination">
        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>First</button>
        <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>Previous</button>
        <span>Page {currentPage} of {totalPages}</span> {/* Only show this at the bottom */}
        <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>Next</button>
        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>Last</button>
      </div>
    </div>
  );
}

export default App;

