import * as fs from "fs";
import * as sqlite3 from "sqlite3";
import { Clue, Crawl, Image } from "./ClueController";
import { isNullOrUndefined } from "util";

/**
 * Wrapper class for the database to provide various ways to interact with it
 */
export class DatabaseWrapper {
  protected db: sqlite3.Database;

  /**
   * Initializes the database by opening the file and running the initialization script
   * @param name name is either the path (including ./) or the string ":memory:"
   * if the database should be created in memory
   */
  constructor(name: string) {
    // initialize the database field by opening the database file
    this.db = new sqlite3.Database(name, (err) => {
      if (err) {
        throw console.error(err.message);
      }
      console.log("Connected to the in-memory SQlite database.");

      // run the initialization script on the database
      this.db.run(fs.readFileSync("./initDB.sql", "utf8"), (err) => {
        if (err) {
          throw console.error(err.message);
        }
        console.log("Successfully initialized the database.");
      });
    });
  }

  /**
   * Close the database connection, returning whether it was successfully closed
   */
  public close() {
    this.db.close((err) => {
      if (err) {
        return false;
      }
      console.log("Close the database connection.");
      return true;
    });
  }

  // CLUE TABLE METHODS

  /**
   *
   * @param name
   * @param place
   * @param crawlId
   */
  addClue(name: string, place: string, crawlId?: number): number {
    // if the clue has a crawl, add its crawl to the database; else, only add the clue
    if (isNullOrUndefined(crawlId)) {
      this.db.run(
        "INSERT INTO clues(crawl_id, name, address, finished) VALUES(?)",
        [crawlId, name, place, 0],
        (err) => {
          if (err) throw console.error(err.message);
        }
      );
    } else {
      this.db.run(
        "INSERT INTO clues(name, address, finished) VALUES(?)",
        [name, place, 0],
        (err) => {
          if (err) throw console.error(err.message);
        }
      );
    }

    // retrieve the clue ID registered from the database
    let clueId: number;
    this.db.get(
      `SELECT clue_id FROM clues WHERE name = ${name}`,
      (err, row) => {
        if (err) {
          throw console.error(err.message);
        } else if (isNullOrUndefined(row)) {
          throw new Error("did not insert desired clue");
        }
        clueId = row.clue_id;
      }
    );

    return clueId;
  }

  /**
   *
   * @param clueID
   * @param pictureEncoding
   */
  addPictureToClue(clueID: number, pictureEncoding: string): number {
    // can we assume that this method will only be called with the names
    // of clues which we know to have beena added, and don't have to check for a clue?

    this.db.run(
      `UPDATE clues SET image = ${pictureEncoding} where clue_id = ${clueID}`,
      (err) => {
        if (err) throw console.error(err.message);
      }
    );

    return clueID;
  }

  /**
   *
   * @param clueID
   */
  completeClue(clueID: number): number {
    this.db.run(`UPDATE clues SET finished = 1 where clue_id = ${clueID}`, (err) => {
      if (err) {
        throw console.error(err.message);
      }
    });

    return clueID;
  }

  /**
   *
   * @param clueID
   */
  deleteClue(clueID: number): void {
    this.db.run(`DELETE FROM clues WHERE clue_id = ${clueID}`, (err) => {
      if (err) {
        throw console.error(err.message);
      }
    });
  }

  /**
   * @returns an array of all the clue_ids in the clues table of the database
   */
  getAllClueIDs(): number[] {
    const allClueIDs: number[] = [];

    this.db.all(`SELECT clue_id FROM clues`, [], (err, rows) => {
      if (err) {
        throw console.error(err.message);
      }
      rows.forEach((row) => {
        allClueIDs.push(row.clue_id);
      });
    });
    return allClueIDs;
  }
  /**
   *  @returns an array of all the clue_ids of the unfinished clues in the clues table of the database
   */
  getAllUnfinishedClueIDs(): number[] {
    const allUnfinishedClueIDs: number[] = [];

    this.db.each(
      `SELECT clue_id FROM clues where finished = 0`,
      [],
      (err, rows) => {
        if (err) {
          throw console.error(err.message);
        }
        rows.forEach((row) => {
          allUnfinishedClueIDs.push(row.clue_id);
        });
      }
    );
    return allUnfinishedClueIDs;
  }

  /**
   *  @returns an array of all the clue_ids of the finished clues in the clues table of the database
   */
  AllFinishedClueIDs(): number[] {
    const AllFinishedClueIDs: number[] = [];

    this.db.each(
      `SELECT clue_id FROM clues where finished = 0`,
      [],
      (err, rows) => {
        if (err) {
          throw console.error(err.message);
        }
        rows.forEach((row) => {
          AllFinishedClueIDs.push(row.clue_id);
        });
      }
    );
    return AllFinishedClueIDs;
  }

  getImageStringOfClue(clueID: number): string{
    let imageString: string;

    this.db.get(`SELECT image FROM clues WHERE clue_id = ${clueID}`, (err, row) => {
      if (err) {
        throw console.error(err.message);
      } else if (isNullOrUndefined(row)) {
        throw new Error("desired clue was not selected");
      }
      imageString = row.image;
    })
  }


  /**
   * Add a Crawl to the database.
   * @param crawlName the crawl to add
   * @return the id of the crawl in the database
   */
  addCrawl(crawlName: string): number {
    this.db.run(
      `INSERT INTO crawls(name) VALUES(${crawlName})
          WHERE NOT EXISTS(SELECT 1 FROM crawls WHERE name = ${crawlName})`,
      (err) => {
        if (err) {
          throw console.error(err.message);
        }
        console.log("Added crawl to database");
      }
    );

    let crawlId: number;
    this.db.get(
      `SELECT crawl_id FROM crawls WHERE name = ${crawlName}`,
      (err, row) => {
        if (err) {
          throw console.error(err.message);
        } else if (isNullOrUndefined(row)) {
          throw new Error("did not insert desired crawl");
        }
        crawlId = row.crawl_id;
      }
    );

    return crawlId;
  }

  // TODO

  // - create crawl without clue
  // - create crawl with clue -- this could end up getting recursive ! make helper methods to handle this without recurring
  // - delete crawl (and all clues)
  // - delete crawl without clues
  // - add clue to crawl
  //
  // - create path with clue(s)
  // - create path without clue
  // - add clue to path
  // - delete path
  // -groups
  //
  // other:
  // - add address table that clues reference
}
