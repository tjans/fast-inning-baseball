import { useRef, useState } from "react";
import ContentWrapper from 'src/components/ContentWrapper';
import Button from 'src/components/Button';

import { db } from "src/db";

const Export = () => {
  const fileInputRef = useRef(null);

  async function exportToFile() {
    const exportData = {};

    // Get all table names
    for (const table of db.tables) {
      const tableName = table.name;
      const allData = await table.toArray();
      exportData[tableName] = allData;
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pwa-backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function importFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      const importedVersion = importData._meta?.dbVersion;

      // Optional version confirmation
      if (importedVersion && importedVersion !== db.verno) {
        const proceed = confirm(
          `Import version (${importedVersion}) does not match current version (${db.verno}). Continue?`
        );
        if (!proceed) return;
      }

      await db.close(); // Ensure fresh start
      await db.open();

      await db.transaction('rw', db.tables, async () => {
        for (const table of db.tables) {
          const tableName = table.name;
          const dataToImport = importData[tableName] || [];

          await table.clear();
          if (dataToImport.length) {
            await table.bulkPut(dataToImport);
          }
        }
      });

      alert("Import completed!");
      fileInputRef.current.value = null;
    } catch (err) {
      console.error("Import failed", err);
      alert("Import failed. See console for details.");
    }
  }


  return (
    <ContentWrapper>
      <Button onClick={exportToFile}
        text="Export Data"
      />

      <Button className="ml-4" onClick={_ => fileInputRef.current.click()}
        text="Import  Data"
      />

      <div className="my-4 hidden">
        <input type="file" ref={fileInputRef} id="importFile" accept=".json" onChange={importFromFile} /></div>
    </ContentWrapper>

  )
}

export default Export