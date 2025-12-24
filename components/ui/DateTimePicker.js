"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimePicker = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const DateTimeField_1 = require("@/components/ui/DateTimeField");
const DateTimePicker = props => {
  return (0, jsx_runtime_1.jsx)(DateTimeField_1.DateTimeField, {
    ...props,
    mode: "datetime",
  });
};
exports.DateTimePicker = DateTimePicker;
//# sourceMappingURL=DateTimePicker.js.map
