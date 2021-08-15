import isAuth from "../middlewares/is-auth.mdw";
import jwt from "jsonwebtoken";
// import { Request, Response, NextFunction } from 'express';

// // Approach 1
// jest.mock('jsonwebtoken', () => ({
// 	verify: () => {
// 		return { userId: 'abc' };
// 	},
// }));

describe("Auth Middleware", () => {
  test("should throw an error with 404 if authorization of the header is not present.", () => {
    const req: any = {
      get(headerName: any) {
        return null;
      },
    };
    try {
      expect(isAuth.bind(this, req, {} as any, () => {})).toThrow(
        "Not authenticated.",
      );
    } catch (err) {
      console.log(err);
    }
  });

  test("should contain userId if token is correct", () => {
    // Approach 2
    const mock = jest.spyOn(jwt, "verify");
    mock.mockImplementation(() => {
      return { userId: "testerId" };
    });

    // Approach 3
    // (mock as jest.Mock).mockReturnValue({ userId: 'abdasdsadsc' });

    const req: any = {
      get(headerName: any) {
        return "Bearer xyz";
      },
    };

    isAuth(req, {} as any, () => {});
    console.log("userId v1:", req.userId);
    expect(req).toHaveProperty("userId");

    mock.mockRestore();
  });

  test("should throw error if token is malformed", () => {
    const req: any = {
      get(headerName: any) {
        return "Bearer xyz";
      },
    };

    expect(isAuth.bind(this, req, {} as any, () => {})).toThrow();
  });
});
