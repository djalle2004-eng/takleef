# Reports & Analytics System

## Overview
Comprehensive reporting system for professors and administrators to generate analytics reports with multiple export options.

## Access
- **Professor Access**: `/dashboard/reports`
- **Admin Access**: Can also access from `/admin` statistics panel

## Available Reports

### 1. Teaching Load per Professor
**Purpose**: View workload distribution across professors

**Metrics**:
- Lectures count
- Tutorials count
- Both (combined) count
- Total preferences per professor

**Data Displayed**:
- Professor name (Latin & Arabic)
- Department
- Academic rank
- Breakdown by teaching type
- Total teaching load

**Use Cases**:
- Identify overloaded professors
- Balance workload distribution
- Plan resource allocation
- Performance review preparation

---

### 2. Subject Coverage Status
**Purpose**: Check which modules are covered by professors

**Summary Cards**:
- Total Modules
- Covered Modules
- Uncovered Modules
- Coverage Percentage

**Data Displayed**:
- Module name
- Department
- Semester
- Number of professors who selected it
- Coverage status (Covered/Uncovered)

**Use Cases**:
- Identify gaps in course coverage
- Ensure all modules have instructors
- Plan hiring needs
- Semester planning

---

### 3. Department Statistics
**Purpose**: Compare statistics across all departments

**Metrics per Department**:
- Total professors
- Total modules
- Active modules
- Total preferences submitted
- Active professors (who submitted preferences)

**Data Displayed**:
- Department name (Arabic)
- All metrics in table format
- Sortable columns

**Use Cases**:
- Cross-department comparison
- Resource allocation
- Identify under-staffed departments
- Budget planning

---

### 4. Historical Data Comparison
**Purpose**: Compare data across multiple academic years

**Status**: Coming soon
**Planned Features**:
- Year-over-year comparison
- Trend analysis
- Growth metrics
- Historical charts

---

## Filters

### Available Filters:
1. **Academic Year**
   - Select specific year
   - Shows active year by default
   - Option: "All Years"

2. **Department**
   - Filter by specific department
   - 5 departments available:
     - قسم العلوم الاقتصادية
     - قسم العلوم المالية والمحاسبة
     - قسم علوم التسيير
     - قسم العلوم التجارية
     - قسم الجذع المشترك
   - Option: "All Departments"

3. **Professor ID** (Teaching Load report only)
   - Filter by specific professor
   - Enter professor ID number
   - Optional field

### Filter Behavior:
- Filters can be combined
- Real-time report updates
- Filters persist during session
- Show/Hide filters toggle

---

## Export Options

### 1. PDF Export
**Method**: Print to PDF
**Features**:
- Browser print dialog
- Optimized print layout
- Includes all visible data
- Header/footer support

**How to Use**:
1. Generate report
2. Click "PDF" button
3. Select "Save as PDF" in print dialog
4. Choose destination and save

---

### 2. Excel Export
**Format**: XLSX
**Features**:
- Full data export
- Preserves formatting
- Multiple sheets support
- Compatible with Microsoft Excel, Google Sheets, LibreOffice

**File Naming**: `{report-type}_{academic-year}.xlsx`

**How to Use**:
1. Generate report
2. Click "Excel" button
3. File downloads automatically
4. Open in your preferred spreadsheet application

**Data Structure**:
- Headers in first row
- Data from row 2
- All columns visible
- Ready for analysis/pivot tables

---

### 3. Print Preview
**Features**:
- Native browser print
- Page break optimization
- Header/footer customization
- Landscape/portrait options

**How to Use**:
1. Generate report
2. Click "Print" button
3. Configure print settings
4. Send to printer or save as PDF

**Print Optimization**:
- Hides navigation elements
- Shows only report content
- Adjusts for paper size
- Maintains formatting

---

### 4. Email Report
**Method**: Opens default email client
**Features**:
- Pre-filled subject line
- Report details in body
- Attach exported file manually

**How to Use**:
1. Generate report
2. Export to Excel/PDF first (optional)
3. Click "Email" button
4. Email client opens with template
5. Attach exported file
6. Add recipients and send

**Email Template Includes**:
- Report type
- Academic year
- Timestamp
- Brief description

---

## API Endpoints

### Teaching Load Report
```
GET /api/reports/teaching-load

Query Parameters:
- academicYearId (optional): Filter by academic year
- department (optional): Filter by department name
- professorId (optional): Filter by specific professor

Response:
{
  "data": [
    {
      "professor_id": 1,
      "full_name_latin": "John Doe",
      "full_name_arabic": "جون دو",
      "academic_rank": "Professor",
      "department": "قسم العلوم الاقتصادية",
      "total_preferences": 5,
      "lecture_count": 2,
      "tutorial_count": 1,
      "both_count": 2
    }
  ]
}
```

### Subject Coverage Report
```
GET /api/reports/subject-coverage

Query Parameters:
- academicYearId (optional): Filter by academic year
- department (optional): Filter by department name

Response:
{
  "data": [...],
  "summary": {
    "totalModules": 150,
    "coveredModules": 120,
    "uncoveredModules": 30,
    "coveragePercentage": "80.0"
  }
}
```

### Department Statistics Report
```
GET /api/reports/department-statistics

Query Parameters:
- academicYearId (optional): Filter by academic year

Response:
{
  "data": [
    {
      "department": "قسم العلوم الاقتصادية",
      "professorCount": 25,
      "moduleCount": 45,
      "activeModuleCount": 40,
      "preferenceCount": 85,
      "activeProfessors": 20
    }
  ]
}
```

---

## UI Features

### Report Type Selection
- **Visual Cards**: Each report type has a colored card
- **Icons**: Distinct icons for easy identification
- **Descriptions**: Brief description of each report
- **Active Indicator**: Selected report highlighted
- **Hover Effects**: Visual feedback on hover

### Data Display
- **Responsive Tables**: Works on all screen sizes
- **Sortable Columns**: Click headers to sort
- **Color Coding**: Status indicators with colors
- **Arabic Support**: RTL text direction where needed
- **Dark Mode**: Full dark mode support

### Loading States
- **Spinner**: Animated loading indicator
- **Skeleton Screens**: Placeholder content
- **Progress Indicators**: For long operations

### Empty States
- **Informative Messages**: Clear next steps
- **Icons**: Visual empty state indicators
- **Call to Action**: Buttons to trigger actions

---

## Technical Details

### Technologies Used
- **Next.js 14**: React framework
- **TypeScript**: Type safety
- **XLSX Library**: Excel file generation
- **Tailwind CSS**: Styling
- **Lucide Icons**: Icon library
- **PostgreSQL**: Database queries

### Performance
- **Lazy Loading**: Report data loaded on demand
- **Caching**: Browser caching for repeated reports
- **Optimized Queries**: Database query optimization
- **Pagination**: For large datasets (future)

### Security
- **Authentication Required**: Must be logged in
- **Role-Based Access**: Professors see own data primarily
- **SQL Injection Protection**: Parameterized queries
- **XSS Prevention**: Sanitized output

---

## Best Practices

### For Professors:
1. **Regular Review**: Check your teaching load regularly
2. **Export for Records**: Keep Excel copies for your records
3. **Compare**: Use historical data to track trends
4. **Plan Ahead**: Use coverage report for next semester planning

### For Administrators:
1. **Monitor Coverage**: Weekly checks on module coverage
2. **Balance Load**: Ensure fair distribution across professors
3. **Department Analysis**: Compare department performance
4. **Data-Driven Decisions**: Use reports for planning

### Report Generation:
1. **Select Specific Filters**: Narrow down data for relevance
2. **Export Before Sharing**: Create Excel/PDF before emailing
3. **Document Findings**: Add notes in exported files
4. **Archive Reports**: Keep historical records

---

## Troubleshooting

### Report Not Loading
- Check internet connection
- Refresh the page
- Clear browser cache
- Try different academic year

### Export Not Working
- Disable popup blockers
- Check browser permissions
- Update browser to latest version
- Try alternative export method

### Data Looks Incorrect
- Verify filter settings
- Check academic year selection
- Ensure preferences are submitted
- Contact admin if persists

---

## Future Enhancements

### Planned Features:
- [ ] Historical comparison charts
- [ ] Automated email scheduling
- [ ] Custom report builder
- [ ] Data visualization dashboard
- [ ] Pagination for large datasets
- [ ] Advanced filtering options
- [ ] Export to multiple formats (CSV, JSON)
- [ ] Report templates
- [ ] Scheduled report generation
- [ ] API access for external systems

---

## Support

For issues or questions about the reports system:
1. Check this documentation
2. Review troubleshooting section
3. Contact system administrator
4. Submit bug report with details

---

## Changelog

### Version 1.0 (Current)
- Initial release
- 4 report types (3 active, 1 planned)
- Multiple export options
- Filter system
- Responsive design
- Dark mode support
