// import {API_BASE_URL} from '../../config';
import axiosInstance from "./axiosInstance";

export const GenerateSpcificDatePdf = async (todayDate, token) => {
  console.log("today date", todayDate);
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
    }
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

// const API_BASE_URL = "http://192.168.1.45:8000/api/purchases";
// console.log("Calling:", `${API_BASE_URL}/slots/`);

// import axios from "axios";
// export const GenerateSpcificDatePdf = async ( todayDate, token ) => {
//   return axios.get(`${API_BASE_URL}/reports/daily/?date=${todayDate}`, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//     responseType: "arraybuffer",
//   });
// };

// export const SpecificDateRangePdf = async (start_date, end_date, token) => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/reports/range/?start_date=${start_date}&end_date=${end_date}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//         responseType: "arraybuffer", // Add this for PDF
//       }
//     );
//     return response;
//   } catch (err) {
//     throw err;
//   }
// };

// export const GetOrderSlots = async (token) => {
//   const url = `${API_BASE_URL}/slots/`;
//   console.log("GET:", url, "TOKEN:", token);

//   try {
//     const response = await axios.get(`${API_BASE_URL}/slots/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

// export const AllPurchaseDetailsData = async (token) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

// export const SpcificDateRangeData = async (start_date, end_date, token) => {
//   try {
//     const response = await axios.get(
//       `${API_BASE_URL}/?start_date=${start_date}&end_date=${end_date}`,
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

// export const SpecificDateData = async (specific_date , token) => {
//   try {
//     const response = await axios.get(`${API_BASE_URL}/?date=${specific_date}`, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };

// export const UpdatePurchasePrice = async (id, price, token) => {
//   try {
//     const response = await axios.put(
//       `${API_BASE_URL}/${id}/update/`,
//       { purchase_price: price },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );
//     return response.data;
//   } catch (err) {
//     throw err;
//   }
// };
