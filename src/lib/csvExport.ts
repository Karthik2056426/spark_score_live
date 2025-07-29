interface Winner {
  studentName: string;
  studentClass: string;
  house: string;
  position: number;
  points: number;
  image?: string;
  eventName?: string;
  eventCategory?: string;
  eventType?: string;
}

interface Event {
  id: string;
  name: string;
  category: string;
  type: string;
  description?: string;
  time?: string;
  venue?: string;
  winners?: Winner[];
  hasResults?: boolean;
}

interface House {
  name: string;
  score: number;
  rank: number;
  color: string;
}

const getCategoryDisplay = (category: string) => {
  switch (category) {
    case '1': return 'Cat 1 (LKG-UKG)';
    case '2': return 'Cat 2 (Class 1-2)';
    case '3': return 'Cat 3 (Class 3-5)';
    case '4': return 'Cat 4 (Class 6-8)';
    case '5': return 'Cat 5 (Class 9-12)';
    case 'all': return 'All Categories';
    default: return category;
  }
};

export const exportToCSV = (events: Event[], houses: House[]) => {
  // House Standings CSV
  const houseData = houses.map(house => ({
    'Rank': house.rank,
    'House Name': house.name,
    'Total Score': house.score,
    'House Color': house.color
  }));

  // Events Overview CSV
  const eventsData = events.map(event => ({
    'Event ID': event.id,
    'Event Name': event.name,
    'Category': getCategoryDisplay(event.category),
    'Type': event.type,
    'Description': event.description || '',
    'Time': event.time || '',
    'Venue': event.venue || '',
    'Has Results': event.hasResults ? 'Yes' : 'No',
    'Number of Winners': event.winners?.length || 0
  }));

  // Winners Details CSV
  const winnersData: any[] = [];
  events.forEach(event => {
    if (event.winners && event.winners.length > 0) {
      event.winners.forEach(winner => {
        winnersData.push({
          'Event Name': event.name,
          'Event Category': getCategoryDisplay(event.category),
          'Event Type': event.type,
          'Position': winner.position,
          'Student Name': winner.studentName,
          'Student Class': winner.studentClass,
          'House': winner.house,
          'Points Earned': winner.points,
          'Has Photo': winner.image ? 'Yes' : 'No'
        });
      });
    }
  });

  // Summary Statistics
  const totalEvents = events.length;
  const eventsWithResults = events.filter(e => e.hasResults).length;
  const totalWinners = winnersData.length;
  const totalPoints = houses.reduce((sum, house) => sum + house.score, 0);

  const summaryData = [
    { 'Metric': 'Total Events', 'Value': totalEvents },
    { 'Metric': 'Events with Results', 'Value': eventsWithResults },
    { 'Metric': 'Total Winners', 'Value': totalWinners },
    { 'Metric': 'Total Points Distributed', 'Value': totalPoints },
    { 'Metric': 'Export Date', 'Value': new Date().toLocaleString() }
  ];

  return {
    houseStandings: convertToCSV(houseData, 'House Standings'),
    eventsOverview: convertToCSV(eventsData, 'Events Overview'),
    winnersDetails: convertToCSV(winnersData, 'Winners Details'),
    summary: convertToCSV(summaryData, 'Summary Statistics')
  };
};

const convertToCSV = (data: any[], title: string) => {
  if (data.length === 0) return `${title}\nNo data available\n\n`;
  
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');
  
  const csvRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',')
  );

  return `${title}\n${csvHeaders}\n${csvRows.join('\n')}\n\n`;
};

export const downloadCSV = (csvContent: string, filename: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportAllData = (events: Event[], houses: House[]) => {
  const csvData = exportToCSV(events, houses);
  
  // Combine all CSV data into one file
  const fullCSV = 
    csvData.summary +
    csvData.houseStandings +
    csvData.eventsOverview +
    csvData.winnersDetails;

  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(fullCSV, `SPARK_Data_Export_${timestamp}.csv`);
};

export const exportSeparateFiles = (events: Event[], houses: House[]) => {
  const csvData = exportToCSV(events, houses);
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Download separate files
  downloadCSV(csvData.summary, `SPARK_Summary_${timestamp}.csv`);
  downloadCSV(csvData.houseStandings, `SPARK_House_Standings_${timestamp}.csv`);
  downloadCSV(csvData.eventsOverview, `SPARK_Events_Overview_${timestamp}.csv`);
  downloadCSV(csvData.winnersDetails, `SPARK_Winners_Details_${timestamp}.csv`);
}; 