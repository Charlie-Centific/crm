import { describe, it, expect } from "vitest";
import {
  inferVertical,
  inferStage,
  inferLeadSource,
  getCol,
  ACCOUNT_COLUMNS,
  CONTACT_COLUMNS,
  OPPORTUNITY_COLUMNS,
} from "../importer/columns";

// ─── inferVertical ─────────────────────────────────────────────────────────────

describe("inferVertical", () => {
  describe("exact VERTICAL_MAP matches", () => {
    it("maps 'Transportation' to transit", () => {
      expect(inferVertical("Transportation")).toBe("transit");
    });

    it("maps 'Mass Transit' to transit", () => {
      expect(inferVertical("Mass Transit")).toBe("transit");
    });

    it("maps 'Rail Transportation' to transit", () => {
      expect(inferVertical("Rail Transportation")).toBe("transit");
    });

    it("maps 'Local and Suburban Transit' to transit", () => {
      expect(inferVertical("Local and Suburban Transit")).toBe("transit");
    });

    it("maps 'Public Administration' to smart_city", () => {
      expect(inferVertical("Public Administration")).toBe("smart_city");
    });

    it("maps 'Municipal Government' to smart_city", () => {
      expect(inferVertical("Municipal Government")).toBe("smart_city");
    });

    it("maps 'State Government' to smart_city", () => {
      expect(inferVertical("State Government")).toBe("smart_city");
    });

    it("maps 'Federal Government' to smart_city", () => {
      expect(inferVertical("Federal Government")).toBe("smart_city");
    });

    it("maps 'Emergency Services' to emergency", () => {
      expect(inferVertical("Emergency Services")).toBe("emergency");
    });

    it("maps 'Public Safety' to emergency", () => {
      expect(inferVertical("Public Safety")).toBe("emergency");
    });

    it("maps 'Transportation/Communication/Electric/Gas/Sanitary Service' to utilities", () => {
      expect(inferVertical("Transportation/Communication/Electric/Gas/Sanitary Service")).toBe("utilities");
    });

    it("maps 'Water Supply' to utilities", () => {
      expect(inferVertical("Water Supply")).toBe("utilities");
    });

    it("maps 'Electric Services' to utilities", () => {
      expect(inferVertical("Electric Services")).toBe("utilities");
    });

    it("maps 'Gas Production and Distribution' to utilities", () => {
      expect(inferVertical("Gas Production and Distribution")).toBe("utilities");
    });
  });

  describe("keyword inference (no exact match)", () => {
    it("infers transit from 'transit' keyword", () => {
      expect(inferVertical("Regional Transit Authority")).toBe("transit");
    });

    it("infers transit from 'bus' keyword", () => {
      expect(inferVertical("Metro Bus Services")).toBe("transit");
    });

    it("infers transit from 'mta' keyword", () => {
      expect(inferVertical("NYC MTA Operations")).toBe("transit");
    });

    it("infers transit from 'bart' keyword", () => {
      expect(inferVertical("BART Rail Systems")).toBe("transit");
    });

    it("infers transit from 'metro' keyword", () => {
      expect(inferVertical("Denver Metro Rail")).toBe("transit");
    });

    it("infers utilities from 'utility' keyword", () => {
      expect(inferVertical("Pacific Utility Corporation")).toBe("utilities");
    });

    it("infers utilities from 'electric' keyword", () => {
      expect(inferVertical("Southern Electric Co")).toBe("utilities");
    });

    it("infers utilities from 'water' keyword", () => {
      expect(inferVertical("City Water Department")).toBe("utilities");
    });

    it("infers emergency from 'emergency' keyword", () => {
      expect(inferVertical("County Emergency Management")).toBe("emergency");
    });

    it("infers emergency from 'fire' keyword", () => {
      expect(inferVertical("Dallas Fire Department")).toBe("emergency");
    });

    it("infers emergency from 'police' keyword", () => {
      // Note: avoid "Metro Police" — "metro" is a transit keyword and is checked first.
      expect(inferVertical("City Police Department")).toBe("emergency");
    });

    it("infers emergency from '911' keyword", () => {
      expect(inferVertical("911 Dispatch Center")).toBe("emergency");
    });

    it("infers smart_city from 'city of' keyword", () => {
      expect(inferVertical("City of Oakland")).toBe("smart_city");
    });

    it("infers smart_city from 'county of' keyword", () => {
      expect(inferVertical("County of San Francisco")).toBe("smart_city");
    });

    it("infers smart_city from 'municipality' keyword", () => {
      expect(inferVertical("Municipality of Nashville")).toBe("smart_city");
    });

    it("is case-insensitive for keyword matching", () => {
      expect(inferVertical("CITY OF AUSTIN")).toBe("smart_city");
      expect(inferVertical("METRO BUS")).toBe("transit");
    });
  });

  describe("fallback and null handling", () => {
    it("returns 'other' for null", () => {
      expect(inferVertical(null)).toBe("other");
    });

    it("returns 'other' for undefined", () => {
      expect(inferVertical(undefined)).toBe("other");
    });

    it("returns 'other' for empty string", () => {
      expect(inferVertical("")).toBe("other");
    });

    it("returns 'other' for an unrecognized value", () => {
      expect(inferVertical("Aerospace Manufacturing")).toBe("other");
    });

    it("returns 'other' for a generic industry label with no matching keywords", () => {
      expect(inferVertical("Retail Trade")).toBe("other");
    });
  });
});

// ─── inferStage ────────────────────────────────────────────────────────────────

describe("inferStage", () => {
  it("maps 'qualify' to lead", () => {
    expect(inferStage("qualify")).toBe("lead");
  });

  it("maps 'lead' to lead", () => {
    expect(inferStage("lead")).toBe("lead");
  });

  it("maps 'develop' to discovery", () => {
    expect(inferStage("develop")).toBe("discovery");
  });

  it("maps 'discovery' to discovery", () => {
    expect(inferStage("discovery")).toBe("discovery");
  });

  it("maps 'propose' to demo", () => {
    expect(inferStage("propose")).toBe("demo");
  });

  it("maps 'demo' to demo", () => {
    expect(inferStage("demo")).toBe("demo");
  });

  it("maps 'workshop' to workshop", () => {
    expect(inferStage("workshop")).toBe("workshop");
  });

  it("maps 'pilot' to pilot_start", () => {
    expect(inferStage("pilot")).toBe("pilot_start");
  });

  it("maps 'pilot start' to pilot_start", () => {
    expect(inferStage("pilot start")).toBe("pilot_start");
  });

  it("maps 'pilot close' to pilot_close", () => {
    expect(inferStage("pilot close")).toBe("pilot_close");
  });

  it("maps 'close' to pilot_close", () => {
    expect(inferStage("close")).toBe("pilot_close");
  });

  it("maps 'won' to closed_won", () => {
    expect(inferStage("won")).toBe("closed_won");
  });

  it("maps 'closed won' to closed_won", () => {
    expect(inferStage("closed won")).toBe("closed_won");
  });

  it("maps 'lost' to closed_lost", () => {
    expect(inferStage("lost")).toBe("closed_lost");
  });

  it("maps 'closed lost' to closed_lost", () => {
    expect(inferStage("closed lost")).toBe("closed_lost");
  });

  it("is case-insensitive", () => {
    expect(inferStage("QUALIFY")).toBe("lead");
    expect(inferStage("Discovery")).toBe("discovery");
    expect(inferStage("CLOSED WON")).toBe("closed_won");
  });

  it("matches substrings (Dynamics step names often include extra text)", () => {
    expect(inferStage("1 - Qualify")).toBe("lead");
    expect(inferStage("2 - Develop Solution")).toBe("discovery");
    expect(inferStage("Stage: Demo / POC")).toBe("demo");
  });

  it("returns 'lead' for null", () => {
    expect(inferStage(null)).toBe("lead");
  });

  it("returns 'lead' for undefined", () => {
    expect(inferStage(undefined)).toBe("lead");
  });

  it("returns 'lead' for empty string", () => {
    expect(inferStage("")).toBe("lead");
  });

  it("returns 'lead' for an unrecognized stage value", () => {
    expect(inferStage("Negotiation")).toBe("lead");
  });
});

// ─── inferLeadSource ───────────────────────────────────────────────────────────

describe("inferLeadSource", () => {
  it("maps 'conference' to conference", () => {
    expect(inferLeadSource("conference")).toBe("conference");
  });

  it("maps 'trade show' to conference", () => {
    expect(inferLeadSource("trade show")).toBe("conference");
  });

  it("maps 'event' to conference", () => {
    expect(inferLeadSource("event")).toBe("conference");
  });

  it("maps 'partner' to partner", () => {
    expect(inferLeadSource("partner")).toBe("partner");
  });

  it("maps 'referral' to partner", () => {
    expect(inferLeadSource("referral")).toBe("partner");
  });

  it("maps 'web' to inbound", () => {
    expect(inferLeadSource("web")).toBe("inbound");
  });

  it("maps 'inbound' to inbound", () => {
    expect(inferLeadSource("inbound")).toBe("inbound");
  });

  it("maps 'marketing' to inbound", () => {
    expect(inferLeadSource("marketing")).toBe("inbound");
  });

  it("is case-insensitive", () => {
    expect(inferLeadSource("CONFERENCE")).toBe("conference");
    expect(inferLeadSource("PARTNER")).toBe("partner");
    expect(inferLeadSource("WEB")).toBe("inbound");
  });

  it("matches substrings (e.g. Dynamics full label)", () => {
    expect(inferLeadSource("ISC West Conference 2025")).toBe("conference");
    expect(inferLeadSource("SHI Partner Referral")).toBe("partner");
    expect(inferLeadSource("Website Form")).toBe("inbound");
  });

  it("returns 'direct' for null", () => {
    expect(inferLeadSource(null)).toBe("direct");
  });

  it("returns 'direct' for undefined", () => {
    expect(inferLeadSource(undefined)).toBe("direct");
  });

  it("returns 'direct' for empty string", () => {
    expect(inferLeadSource("")).toBe("direct");
  });

  it("returns 'direct' for an unrecognized source", () => {
    expect(inferLeadSource("Cold Outreach")).toBe("direct");
  });
});

// ─── getCol ────────────────────────────────────────────────────────────────────

describe("getCol", () => {
  const row = {
    "Account Name": "City of Austin",
    "Job Title": "CTO",
    "": "should be skipped",
  };

  it("returns the value for the first matching variant", () => {
    expect(getCol(row, ["Account Name", "name", "Company Name"])).toBe("City of Austin");
  });

  it("tries variants in order and returns the first match", () => {
    // 'name' is not in the row; 'Account Name' is
    const rowWithoutFirst = { name: "City of Dallas" };
    expect(getCol(rowWithoutFirst, ["Account Name", "name"])).toBe("City of Dallas");
  });

  it("returns null when no variant matches", () => {
    expect(getCol(row, ["Organization Name", "Entity Name"])).toBeNull();
  });

  it("returns null for an empty row", () => {
    expect(getCol({}, ["Account Name", "name"])).toBeNull();
  });

  it("trims whitespace from matched values", () => {
    const padded = { "Account Name": "  Louisville Metro  " };
    expect(getCol(padded, ["Account Name"])).toBe("Louisville Metro");
  });

  it("skips keys where the value is an empty string", () => {
    const rowWithEmpty = { "Account Name": "", name: "Fallback Name" };
    expect(getCol(rowWithEmpty, ["Account Name", "name"])).toBe("Fallback Name");
  });

  it("works with ACCOUNT_COLUMNS field variants", () => {
    const dynamics = { "Account Name": "Denver RTD" };
    expect(getCol(dynamics, ACCOUNT_COLUMNS.name)).toBe("Denver RTD");
  });

  it("works with CONTACT_COLUMNS field variants", () => {
    const dynamics = { "First Name": "Maria", "Last Name": "Santos" };
    expect(getCol(dynamics, CONTACT_COLUMNS.firstName)).toBe("Maria");
    expect(getCol(dynamics, CONTACT_COLUMNS.lastName)).toBe("Santos");
  });

  it("works with OPPORTUNITY_COLUMNS field variants", () => {
    const dynamics = { "Est. Revenue": "450000", "Sales Stage": "Discovery" };
    expect(getCol(dynamics, OPPORTUNITY_COLUMNS.value)).toBe("450000");
    expect(getCol(dynamics, OPPORTUNITY_COLUMNS.stage)).toBe("Discovery");
  });
});

// ─── Column map structure ──────────────────────────────────────────────────────

describe("column map structure", () => {
  it("ACCOUNT_COLUMNS has all required field keys", () => {
    const required = ["dynamicsId", "name", "website", "city", "state", "country", "employeeCount", "vertical"];
    for (const key of required) {
      expect(ACCOUNT_COLUMNS).toHaveProperty(key);
      expect((ACCOUNT_COLUMNS as Record<string, readonly string[]>)[key].length).toBeGreaterThan(0);
    }
  });

  it("CONTACT_COLUMNS has all required field keys", () => {
    const required = ["dynamicsId", "firstName", "lastName", "role", "email", "phone", "accountName"];
    for (const key of required) {
      expect(CONTACT_COLUMNS).toHaveProperty(key);
      expect((CONTACT_COLUMNS as Record<string, readonly string[]>)[key].length).toBeGreaterThan(0);
    }
  });

  it("OPPORTUNITY_COLUMNS has all required field keys", () => {
    const required = ["dynamicsId", "name", "accountName", "stage", "value", "closeDate", "leadSource", "ownerName"];
    for (const key of required) {
      expect(OPPORTUNITY_COLUMNS).toHaveProperty(key);
      expect((OPPORTUNITY_COLUMNS as Record<string, readonly string[]>)[key].length).toBeGreaterThan(0);
    }
  });

  it("all ACCOUNT_COLUMNS variants are non-empty strings", () => {
    for (const variants of Object.values(ACCOUNT_COLUMNS)) {
      for (const v of variants) {
        expect(typeof v).toBe("string");
        expect(v.length).toBeGreaterThan(0);
      }
    }
  });
});
