import { Prisma } from "@prisma/client";
import { customerRepository } from "../repositories/customer.repository";
import { HttpError } from "../utils/http";

type CustomerImportRow = {
  phone: string;
  name?: string;
  notes?: string;
  isSubscribed?: boolean;
};

const normalizePhone = (phone: string) => phone.replace(/[^\d+]/g, "").trim();

const parseBoolean = (value: string | undefined) => {
  if (!value) return false;
  return ["true", "1", "yes", "y", "subscribed"].includes(value.trim().toLowerCase());
};

const parseCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

const escapeCsv = (value: unknown) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const customerService = {
  async create(input: CustomerImportRow) {
    const phone = normalizePhone(input.phone);
    if (!phone) throw new HttpError(422, "Phone is required");
    return customerRepository.create({
      phone,
      name: input.name || undefined,
      notes: input.notes || undefined,
      isSubscribed: Boolean(input.isSubscribed),
      subscriptionDate: input.isSubscribed ? new Date() : undefined
    });
  },

  async update(id: string, input: { name?: string; phone?: string; notes?: string | null; isSubscribed?: boolean }) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new HttpError(404, "Customer not found");

    const data: Prisma.CustomerUpdateInput = {
      name: input.name,
      phone: input.phone ? normalizePhone(input.phone) : undefined,
      notes: input.notes,
      isSubscribed: input.isSubscribed,
      subscriptionDate:
        input.isSubscribed === true && !existing.subscriptionDate
          ? new Date()
          : input.isSubscribed === false
            ? null
            : undefined
    };

    return customerRepository.update(id, data);
  },

  async remove(id: string) {
    const existing = await customerRepository.findById(id);
    if (!existing) throw new HttpError(404, "Customer not found");
    return customerRepository.delete(id);
  },

  async importCsv(buffer: Buffer) {
    const text = buffer.toString("utf8").replace(/^\uFEFF/, "");
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (lines.length < 2) throw new HttpError(422, "CSV must contain a header and at least one customer row");

    const headers = parseCsvLine(lines[0]).map((header) => header.trim().toLowerCase());
    const phoneIndex = headers.indexOf("phone");
    if (phoneIndex === -1) throw new HttpError(422, "CSV header must include phone");

    const rows = lines.slice(1).map((line) => {
      const cells = parseCsvLine(line);
      const get = (name: string) => {
        const index = headers.indexOf(name);
        return index === -1 ? undefined : cells[index]?.trim();
      };
      return {
        phone: normalizePhone(cells[phoneIndex] ?? ""),
        name: get("name"),
        notes: get("notes"),
        isSubscribed: parseBoolean(get("issubscribed") ?? get("subscribed"))
      };
    });

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
      if (!row.phone) {
        skipped += 1;
        continue;
      }

      const result = await customerRepository.upsertImported(row);
      if (result.created) created += 1;
      else updated += 1;
    }

    return { created, updated, skipped, total: rows.length };
  },

  async exportCsv() {
    const customers = await customerRepository.exportAll();
    const header = ["name", "phone", "isSubscribed", "notes", "createdAt", "lastMessageAt"];
    const rows = customers.map((customer) => [
      customer.name,
      customer.phone,
      customer.isSubscribed,
      customer.notes,
      customer.createdAt.toISOString(),
      customer.lastMessageAt?.toISOString() ?? ""
    ]);
    return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
  }
};
