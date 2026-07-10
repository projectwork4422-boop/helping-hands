import fs from 'fs';
import https from 'https';

https.get('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    const districts = new Set();
    json.states.forEach(state => {
      state.districts.forEach(d => {
        districts.add(d.trim());
      });
    });
    
    const sortedDistricts = Array.from(districts).sort();
    
    const tsContent = `export const INDIAN_DISTRICTS = ${JSON.stringify(sortedDistricts, null, 2)};\n`;
    fs.writeFileSync('src/lib/indianDistricts.ts', tsContent);
    console.log('Successfully saved ' + sortedDistricts.length + ' districts');
  });
});
