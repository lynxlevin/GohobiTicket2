class PermissionByActionMixin(object):
    def get_permissions(self):
        permissions = [*self.common_permission_classes]

        for action, permission_classess in self.permission_classes_by_action.items():
            if self.action == action:
                permissions.extend(permission_classess)

        return [permission() for permission in permissions]
