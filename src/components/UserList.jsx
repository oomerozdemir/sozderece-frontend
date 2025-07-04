import React from "react";
import { List, Datagrid, TextField, EmailField, EditButton, DeleteButton } from "react-admin";

export const UserList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <EmailField source="email" />
      <TextField source="role" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);
