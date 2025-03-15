// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleAssetNFT {
    struct Asset {
        string name;
        string description;
        string assetType;
        string governmentId;
        bool verified;
        string ipfsHash;
    }

    // Events
    event AssetMinted(uint256 indexed tokenId, address indexed owner);
    event AssetVerified(uint256 indexed tokenId);

    // State variables
    mapping(uint256 => Asset) public assets;
    mapping(uint256 => address) public assetOwners;
    mapping(address => uint256[]) public ownerAssets;
    uint256 public totalAssets;

    // Mint a new asset
    function mintAsset(
        string memory _name,
        string memory _description,
        string memory _assetType,
        string memory _governmentId,
        string memory _ipfsHash
    ) public returns (uint256) {
        uint256 tokenId = totalAssets + 1;
        
        assets[tokenId] = Asset({
            name: _name,
            description: _description,
            assetType: _assetType,
            governmentId: _governmentId,
            verified: false,
            ipfsHash: _ipfsHash
        });

        assetOwners[tokenId] = msg.sender;
        ownerAssets[msg.sender].push(tokenId);
        totalAssets = tokenId;

        emit AssetMinted(tokenId, msg.sender);
        return tokenId;
    }

    // Verify an asset
    function verifyAsset(uint256 _tokenId) public {
        require(_tokenId <= totalAssets, "Asset does not exist");
        assets[_tokenId].verified = true;
        emit AssetVerified(_tokenId);
    }

    // Get asset details
    function getAsset(uint256 _tokenId) public view returns (Asset memory) {
        require(_tokenId <= totalAssets, "Asset does not exist");
        return assets[_tokenId];
    }

    // Get all assets owned by an address
    function getOwnerAssets(address _owner) public view returns (uint256[] memory) {
        return ownerAssets[_owner];
    }

    // Transfer asset
    function transferAsset(address _to, uint256 _tokenId) public {
        require(assetOwners[_tokenId] == msg.sender, "Not the owner");
        require(_to != address(0), "Invalid address");

        // Remove from current owner's array
        uint256[] storage fromAssets = ownerAssets[msg.sender];
        for (uint256 i = 0; i < fromAssets.length; i++) {
            if (fromAssets[i] == _tokenId) {
                fromAssets[i] = fromAssets[fromAssets.length - 1];
                fromAssets.pop();
                break;
            }
        }

        // Add to new owner's array
        ownerAssets[_to].push(_tokenId);
        assetOwners[_tokenId] = _to;
    }
} 