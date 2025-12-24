"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DateTimeField_1 = require("@/components/ui/DateTimeField");
const DatePicker = props => {
  return (0, jsx_runtime_1.jsx)(DateTimeField_1.DateTimeField, {
    ...props,
    mode: "date",
  });
};
exports.DatePicker = DatePicker;
//# sourceMappingURL=DatePicker.js.map
