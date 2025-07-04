// src/components/CreateUser.jsx
import React from "react";
import { Create, SimpleForm, TextInput, SelectInput } from "react-admin";

export const CreateUser = (props) => (
  <Create {...props}>
    <SimpleForm>
      <TextInput source="name" />
      <TextInput source="email" />
      <TextInput source="password" type="password" />
      <SelectInput source="role" choices={[
        { id: "student", name: "Student" },
        { id: "coach", name: "Coach" },
        { id: "admin", name: "Admin" }
      ]} />
    </SimpleForm>
  </Create>
);
