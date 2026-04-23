import axiosInstance from "./axiosInstance";

export const GenerateSpcificDatePdf = async (todayDate, token) => {
  return axiosInstance.get(`/reports/daily/?date=${todayDate}`, {
    responseType: "arraybuffer",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const SpecificDateRangePdf = async (start_date, end_date) => {
  return axiosInstance.get(
    `/reports/range/?start_date=${start_date}&end_date=${end_date}`,
    {
      responseType: "arraybuffer",
    },
  );
};

export const GetOrderSlots = async () => {
  return axiosInstance.get("/slots/").then((response) => response.data);
};

export const AllPurchaseDetailsData = async () => {
  return axiosInstance.get("/").then((response) => response.data);
};

export const SpcificDateRangeData = async (start_date, end_date) => {
  return axiosInstance
    .get(`/?start_date=${start_date}&end_date=${end_date}`)
    .then((response) => response.data);
};

export const SpecificDateData = async (specific_date) => {
  return axiosInstance
    .get(`/?date=${specific_date}`)
    .then((response) => response.data);
};

export const UpdatePurchasePrice = async (id, price, selling_price) => {
  return axiosInstance
    .put(`/${id}/update/`, {
      purchase_price: price,
      selling_price: selling_price,
    })
    .then((response) => response.data);
};
