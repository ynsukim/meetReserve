import * as SQLite from 'expo-sqlite';
import { Reservation } from '../../types/reservation';

// Database connection
let db: SQLite.SQLiteDatabase | null = null;

// Initialize database
export const initDatabase = async (): Promise<void> => {
  if (db !== null) return;
  
  db = await SQLite.openDatabaseAsync('reservations.db');
  
  // Create the reservations table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL, 
      day INTEGER NOT NULL,
      hour INTEGER NOT NULL,
      minute INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      name TEXT NOT NULL
    )
  `);

  // Drop the name history table if it exists to ensure schema consistency
  await db.execAsync(`DROP TABLE IF EXISTS name_history;`);

  // Create the name history table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS name_history (
      name TEXT NOT NULL, 
      last_used INTEGER NOT NULL,
      PRIMARY KEY (name) 
    )
  `);
};

// Save a reservation (create or update)
export const saveReservation = async (reservation: Reservation): Promise<string> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');
  
  if (reservation.id) {
    // Update existing reservation
    await db.runAsync(
      `UPDATE reservations 
       SET year = ?, month = ?, day = ?, hour = ?, minute = ?, duration = ?, name = ?
       WHERE id = ?`,
      [
        reservation.year,
        reservation.month,
        reservation.day,
        reservation.hour,
        reservation.minute,
        reservation.duration,
        reservation.name,
        reservation.id
      ]
    );
    return reservation.id;
  } else {
    // Create new reservation
    const result = await db.runAsync(
      `INSERT INTO reservations (year, month, day, hour, minute, duration, name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reservation.year,
        reservation.month,
        reservation.day,
        reservation.hour,
        reservation.minute,
        reservation.duration,
        reservation.name
      ]
    );
    return result.lastInsertRowId.toString();
  }
};

// Get all reservations
export const getReservations = async (): Promise<Reservation[]> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');
  
  const rows = await db.getAllAsync('SELECT * FROM reservations');
  
  return rows.map((row: any) => {
    const date = new Date(row.year, row.month, row.day);
    return {
      id: row.id.toString(),
      year: row.year, 
      month: row.month,
      day: row.day,
      hour: row.hour,
      minute: row.minute,
      duration: row.duration,
      name: row.name,
      date
    };
  });
};

// Delete a reservation
export const deleteReservation = async (id: string): Promise<void> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');
  
  await db.runAsync('DELETE FROM reservations WHERE id = ?', [id]);
};

// Get reservations for a specific date range
export const getReservationsForWeek = async (startDate: Date, endDate: Date): Promise<Reservation[]> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');
  
  const startYear = startDate.getFullYear();
  const startMonth = startDate.getMonth();
  const startDay = startDate.getDate();
  
  const endYear = endDate.getFullYear();
  const endMonth = endDate.getMonth();
  const endDay = endDate.getDate();
  
  const rows = await db.getAllAsync(
    `SELECT * FROM reservations 
     WHERE (year > ? OR (year = ? AND month > ?) OR (year = ? AND month = ? AND day >= ?))
     AND (year < ? OR (year = ? AND month < ?) OR (year = ? AND month = ? AND day <= ?))
     ORDER BY year, month, day, hour, minute`,
    [
      startYear, startYear, startMonth, startYear, startMonth, startDay,
      endYear, endYear, endMonth, endYear, endMonth, endDay
    ]
  );
  
  return rows.map((row: any) => {
    const date = new Date(row.year, row.month, row.day);
    return {
      id: row.id.toString(),
      year: row.year,
      month: row.month,
      day: row.day,
      hour: row.hour,
      minute: row.minute,
      duration: row.duration,
      name: row.name,
      date
    };
  });
};

// Backup and restore logic can be added later
export const backupDatabase = async (): Promise<void> => {
  // This will be implemented later for syncing
  console.log('Database backup functionality will be implemented later');
};

export const syncDatabase = async (): Promise<void> => {
  // This will be implemented later for syncing
  console.log('Database sync functionality will be implemented later');
};

// Save a name to history (Insert or Update)
export const saveNameToHistory = async (name: string): Promise<void> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');

  const trimmedName = name.trim();
  if (!trimmedName) return; // Don't save empty names

  await db.runAsync(
    'INSERT INTO name_history (name, last_used) VALUES (?, ?) ' +
    'ON CONFLICT(name) DO UPDATE SET last_used = excluded.last_used',
    [trimmedName, Date.now()]
  );
  console.log(`Saved/Updated '${trimmedName}' in name history.`);
};

// Get recent names
export const getRecentNames = async (limit: number = 10): Promise<string[]> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');

  const rows = await db.getAllAsync(
    'SELECT name FROM name_history ORDER BY last_used DESC LIMIT ?',
    [limit]
  );

  console.log(`Fetched recent names: ${JSON.stringify(rows.map((r: any) => r.name))}`);
  return rows.map((row: any) => row.name);
};

// Delete a name from history
export const deleteNameFromHistory = async (nameToDelete: string): Promise<void> => {
  if (!db) await initDatabase();
  if (!db) throw new Error('Database not initialized');

  const trimmedName = nameToDelete.trim();
  if (!trimmedName) return; // Don't attempt to delete empty names

  try {
    await db.runAsync('DELETE FROM name_history WHERE name = ?', [trimmedName]);
    console.log(`Deleted '${trimmedName}' from name history.`);
  } catch (error) {
    console.error(`Error deleting name '${trimmedName}' from history:`, error);
    throw error; // Re-throw the error to be caught by the caller if needed
  }
}; 