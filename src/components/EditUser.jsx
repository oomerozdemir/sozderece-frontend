// src/components/EditUser.jsx
import React from "react";
import { Edit, SimpleForm, TextInput, SelectInput } from "react-admin";

export const EditUser = (props) => (
  <Edit {...props}>
    <SimpleForm>
      <TextInput source="id" disabled />
      <TextInput source="name" />
      <TextInput source="email" />
      <SelectInput source="role" choices={[
        { id: "student", name: "Student" },
        { id: "coach", name: "Coach" },
        { id: "admin", name: "Admin" }
      ]} />
    </SimpleForm>
  </Edit>
);
