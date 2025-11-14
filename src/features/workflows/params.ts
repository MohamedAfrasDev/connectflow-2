// for server component
import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const workflowsParams = {
  page: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE),
  search: parseAsString.withDefault(""),
};
