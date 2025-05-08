#include <iostream>

using namespace std;

struct Node
{
    int data;
    Node *left;
    Node *right;

    Node(int value)  {
        this->data = value;
        this->left = this->right = nullptr;
    }
};

Node *buildTree(int arr[], int index, int n)
{
    if (index >= n || arr[index] == -1)
    {
        return nullptr;
    }

    Node *node = new Node(arr[index]);

    node->left = buildTree(arr, 2 * index + 1, n);
    node->right = buildTree(arr, 2 * index + 2, n);

    return node;
}

void tienthutu(Node *root) {

    if (root == nullptr)
        return;

    cout << root->data << " ";
    tienthutu(root->left);
    tienthutu(root->right);
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(nullptr);

    int n;
    cin >> n;
    int tree[n];

    for (int i = 0; i < n; i++) {
        cin >> tree[i];
    }

    Node *root = buildTree(tree, 0, n);

    tienthutu(root);

    return 0;
}
